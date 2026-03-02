#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "pypdf>=5.0",
#   "anthropic>=0.40",
# ]
# ///
"""update_data.py — Fetch fresh data from all sources and rewrite activityData.json

Usage:
    uv run scripts/update_data.py

uv automatically creates an isolated environment with the required packages.
Set ANTHROPIC_API_KEY for LLM-powered title/date extraction from PDFs.
"""

import html as html_module
import io
import json
import os
import re
import sys
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import anthropic
import pypdf

# ── Config ────────────────────────────────────────────────────────────────────

ACTOR = "gatewayprogram.bsky.social"
GALLERY_URL = "https://www.gatewayprogram.org/photo-gallery.html"
UPLOAD_BASE = "https://www.gatewayprogram.org/wp-content/uploads"
VIDEO_GALLERY_URL = "https://www.gatewayprogram.org/video-gallery.html"

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_FILE = SCRIPT_DIR.parent / "src" / "assets" / "activityData.json"


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"}

MAX_MONTHS_LOOKBACK = 24

# PDF filename substrings that are silently ignored (not reported as unclassified)
IGNORED_PDF_PATTERNS = (
    "board",          # board meetings, agendas, presentations, minutes
    "agenda",
    "minutes",
    "public-comment",
    "publiccomment",
    "public-mins",
    "public-session",
    "resolution",
)

# ── Text normalization ────────────────────────────────────────────────────────

_UNICODE_REPLACEMENTS = str.maketrans({
    "\u2018": "'",   # left single quotation mark
    "\u2019": "'",   # right single quotation mark
    "\u201a": "'",   # single low-9 quotation mark
    "\u201b": "'",   # single high-reversed-9 quotation mark
    "\u201c": '"',   # left double quotation mark
    "\u201d": '"',   # right double quotation mark
    "\u201e": '"',   # double low-9 quotation mark
    "\u2013": "-",   # en dash
    "\u2014": "-",   # em dash
    "\u2015": "-",   # horizontal bar
    "\u2026": "...", # ellipsis
    "\u00a0": " ",   # non-breaking space
})

def normalize(text: str) -> str:
    return text.translate(_UNICODE_REPLACEMENTS)

# ── HTTP ──────────────────────────────────────────────────────────────────────

def fetch_url(url, as_json=False):
    """Fetch a URL as text or JSON. Returns (content, error_string)."""
    req = Request(url, headers={"User-Agent": "gateway-tracker-updater/1.0"})
    try:
        with urlopen(req, timeout=20) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
    except HTTPError as e:
        return None, f"HTTP {e.code}"
    except URLError as e:
        return None, str(e.reason)
    except Exception as e:
        return None, str(e)
    if as_json:
        try:
            return json.loads(raw), None
        except json.JSONDecodeError as e:
            return None, f"JSON parse error: {e}"
    return raw, None


def fetch_bytes(url):
    """Fetch a URL as raw bytes. Returns (bytes, error_string)."""
    req = Request(url, headers={"User-Agent": "gateway-tracker-updater/1.0"})
    try:
        with urlopen(req, timeout=30) as resp:
            return resp.read(), None
    except Exception as e:
        return None, str(e)


# ── Existing data cache ───────────────────────────────────────────────────────

def load_existing_data():
    """Load activityData.json and return a dict keyed by URL/link for cache lookups."""
    if not DATA_FILE.exists():
        return {}
    try:
        data = json.loads(DATA_FILE.read_text())
    except Exception as e:
        print(f"  WARNING: could not parse existing data file: {e}")
        return {}
    existing = {}
    for item in data.get("images", []):
        existing[item["url"]] = item
    for item in data.get("pressReleases", []):
        existing[item["link"]] = item
    for item in data.get("constructionNotices", []):
        existing[item["link"]] = item
    for item in data.get("youtubeVideos", []):
        existing[item["videoId"]] = item
    return existing


# ── Date inference ────────────────────────────────────────────────────────────

def infer_date_from_filename(filename, fallback_year, fallback_month):
    """Fallback date inference used when no API key is set.

    Only handles the unambiguous YYYYMMDD pattern; everything else falls back
    to the first of the month from the upload directory path.
    Returns (date_str, is_fallback).
    """
    m = re.search(r"(\d{4})(\d{2})(\d{2})", filename)
    if m:
        y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if 2010 <= y <= 2040 and 1 <= mo <= 12 and 1 <= d <= 31:
            return f"{y:04d}-{mo:02d}-{d:02d}", False
    return f"{fallback_year:04d}-{fallback_month:02d}-01", True


def year_month_from_url(url):
    """Extract (year, month) from a wp-content/uploads/YYYY/MM/ URL."""
    try:
        parts = url.split("/uploads/", 1)[1].split("/")
        return int(parts[0]), int(parts[1])
    except (IndexError, ValueError):
        now = datetime.now()
        return now.year, now.month


def filter_date_mismatches(entries, kind):
    """Drop entries whose LLM-extracted date year doesn't match the upload folder year.

    Only applied when _is_fallback is False (i.e. LLM actually extracted a date).
    Folder-date fallbacks are left alone since the date IS the folder date.
    """
    kept, skipped = [], []
    for e in entries:
        if e.get("_is_fallback", True):
            kept.append(e)
            continue
        folder_year, _ = year_month_from_url(e["link"])
        try:
            item_year = int(e["date"][:4])
        except (ValueError, IndexError):
            kept.append(e)
            continue
        if item_year != folder_year:
            skipped.append((e, folder_year))
        else:
            kept.append(e)
    if skipped:
        print(f"  Skipped {len(skipped)} {kind} (year mismatch with upload folder):")
        for e, folder_year in skipped:
            fname = e["link"].rsplit("/", 1)[-1]
            print(f"    {fname}")
            print(f"      extracted date: {e['date']} — folder year: {folder_year}")
    return kept


# ── Bluesky ───────────────────────────────────────────────────────────────────

def extract_image_url(embed):
    """Recursively extract the best imageUrl from a Bluesky embed view."""
    if not embed:
        return None
    t = embed.get("$type", "")
    if t == "app.bsky.embed.images#view":
        imgs = embed.get("images", [])
        return imgs[0].get("thumb") if imgs else None
    if t == "app.bsky.embed.video#view":
        return embed.get("thumbnail")
    if t == "app.bsky.embed.recordWithMedia#view":
        return extract_image_url(embed.get("media"))
    return None


def fetch_bluesky_posts(limit=10):
    print("Fetching Bluesky posts...")
    url = (
        f"https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed"
        f"?actor={ACTOR}&limit=50&filter=posts_no_replies"
    )
    data, err = fetch_url(url, as_json=True)
    if err:
        print(f"  ERROR: {err}")
        return []

    posts = []
    for item in data.get("feed", []):
        if item.get("reason"):
            continue  # skip reposts
        post = item["post"]
        record = post.get("record", {})
        if record.get("reply"):
            continue  # belt-and-suspenders; filter param should handle this

        text = normalize(record.get("text", "").strip())
        if not text:
            continue

        uri = post.get("uri", "")
        rkey = uri.rsplit("/", 1)[-1] if "/" in uri else uri
        entry = {
            "text": text,
            "date": record.get("createdAt", ""),
            "link": f"https://bsky.app/profile/{ACTOR}/post/{rkey}",
        }
        image_url = extract_image_url(post.get("embed"))
        if image_url:
            entry["imageUrl"] = image_url
        posts.append(entry)

        if len(posts) >= limit:
            break

    print(f"  → {len(posts)} posts")
    return posts


# ── Photo gallery ─────────────────────────────────────────────────────────────

class GalleryParser(HTMLParser):
    """Parse WordPress block gallery structure:
    <li class="blocks-gallery-item">
      <figure>
        <a href="IMAGE_URL"><img .../></a>
        <figcaption>Caption text</figcaption>
      </figure>
    </li>
    """

    def __init__(self):
        super().__init__()
        self.photos = []
        self._in_item = False
        self._current_url = None
        self._capturing = False
        self._parts = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "li" and "blocks-gallery-item" in attrs.get("class", ""):
            self._in_item = True
            self._current_url = None
        elif tag == "a" and self._in_item:
            href = attrs.get("href", "")
            ext = "." + href.rsplit(".", 1)[-1].lower() if "." in href else ""
            if ext in IMAGE_EXTENSIONS:
                self._current_url = href
        elif tag == "figcaption" and self._in_item and self._current_url:
            self._capturing = True
            self._parts = []

    def handle_data(self, data):
        if self._capturing:
            self._parts.append(data)

    def handle_endtag(self, tag):
        if tag == "figcaption" and self._capturing:
            self._capturing = False
            caption = normalize(html_module.unescape("".join(self._parts)).strip())
            if self._current_url:
                self.photos.append({"url": self._current_url, "caption": caption})
                self._current_url = None
        elif tag == "li":
            # Save any photo that had a URL but no figcaption
            if self._current_url:
                self.photos.append({"url": self._current_url, "caption": ""})
            self._in_item = False
            self._current_url = None
            self._capturing = False


def strip_caption_date(caption):
    """Remove date prefixes/suffixes the gallery appends to captions."""
    caption = re.sub(r'\s*\([A-Za-z]+ (?:\d{1,2},\s*)?\d{4}\)\s*\.?\s*$', '', caption)
    caption = re.sub(r'^[A-Za-z]+ \d{4}:\s*', '', caption)
    return caption.strip()


def fetch_photos(limit=10):
    print("Fetching photo gallery...")
    html_content, err = fetch_url(GALLERY_URL)
    if err:
        print(f"  ERROR: {err}")
        return []
    parser = GalleryParser()
    parser.feed(html_content)
    photos = [
        {"url": p["url"], "caption": strip_caption_date(p["caption"])}
        for p in parser.photos[:limit]
    ]
    print(f"  → {len(photos)} photos")
    return photos


# ── WordPress directory scraping ──────────────────────────────────────────────

class DirListingParser(HTMLParser):
    """Extract hrefs from an Apache/Nginx autoindex page."""

    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            href = dict(attrs).get("href", "")
            if href and not href.startswith("?") and href not in ("../", "/"):
                self.links.append(href)


def fetch_wp_directory(year, month):
    """Return absolute file URLs from a WordPress upload directory listing, or []."""
    dir_url = f"{UPLOAD_BASE}/{year:04d}/{month:02d}/"
    html_content, err = fetch_url(dir_url)
    if err or not html_content or "<a href=" not in html_content:
        return []

    parser = DirListingParser()
    parser.feed(html_content)

    results = []
    for link in parser.links:
        if link.startswith("http"):
            results.append(link)
        elif link.startswith("/"):
            results.append("https://www.gatewayprogram.org" + link)
        else:
            results.append(dir_url + link)
    return results


def pdf_filename_to_title(filename):
    """Derive a human-readable title from a PDF filename."""
    name = filename
    if name.lower().endswith(".pdf"):
        name = name[:-4]
    name = name.replace("-", " ").replace("_", " ")
    return " ".join(name.split()).title()


# ── PDF enrichment via LLM ────────────────────────────────────────────────────

def extract_pdf_text(pdf_bytes):
    """Extract plain text from the first few pages of a PDF."""
    reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
    return "\n".join(page.extract_text() or "" for page in reader.pages[:4])


def llm_extract_pdf_metadata(client, text, filename):
    """Ask Claude to extract title and date from PDF text. Returns a dict."""
    prompt = f"""Extract the title and date from this PDF document.

Filename: {filename}

Document text:
{text[:3000]}

Return a JSON object with exactly two fields:
- "title": the document's official title or subject heading (not the filename). Use title case regardless of how it appears in the document. Should be concise and human-readable.
- "date": the date the document was issued, in YYYY-MM-DD format.

Return only the JSON object, no other text. Use null if a value cannot be determined."""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=256,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = message.content[0].text.strip()
    m = re.search(r"\{.*\}", raw, re.DOTALL)
    if not m:
        raise ValueError(f"no JSON in LLM response: {raw!r}")
    return json.loads(m.group())


def llm_infer_dates_from_filenames(client, filenames):
    """Ask Claude to batch-extract dates from a list of filenames.

    Returns a list of (date_str | None, is_fallback) in the same order as input.
    date_str is None if Claude couldn't determine any date.
    """
    numbered = "\n".join(f"{i + 1}. {f}" for i, f in enumerate(filenames))
    prompt = f"""Extract the date from each filename. Filenames may use various formats (YYYYMMDD, YYYY-MM-DD, YYYY.MM.DD, MM-DD-YYYY, Month-D-YYYY, etc.).

{numbered}

Return a JSON array with one object per filename (in the same order):
- "date": the date in YYYY-MM-DD format, or null if no date can be determined
- "exact": true if a full year/month/day was found; false if only year/month (use 01 for the missing day)

Return only the JSON array, no other text."""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = message.content[0].text.strip()
    match = re.search(r"\[.*\]", raw, re.DOTALL)
    if not match:
        raise ValueError(f"no JSON array in LLM response: {raw!r}")
    results = json.loads(match.group())
    return [(r.get("date"), not r.get("exact", False)) for r in results]


def enrich_pdfs(entries, client, existing):
    """Download each PDF and use an LLM to replace filename-derived title and date.

    Skips LLM calls for entries whose link is already in the existing data cache.
    """
    if not client:
        print("  (skipping — ANTHROPIC_API_KEY not set)")
        return entries

    enriched = []
    for entry in entries:
        fname = entry["link"].rsplit("/", 1)[-1]
        result = dict(entry)
        if entry["link"] in existing:
            print(f"  cached:    {fname}")
            result["title"] = existing[entry["link"]]["title"]
            result["date"] = existing[entry["link"]]["date"]
            result["_is_fallback"] = False
        else:
            print(f"  enriching: {fname}")
            try:
                pdf_bytes, err = fetch_bytes(entry["link"])
                if err:
                    raise RuntimeError(f"download failed: {err}")
                text = extract_pdf_text(pdf_bytes)
                metadata = llm_extract_pdf_metadata(client, text, fname)
                if metadata.get("title"):
                    result["title"] = normalize(metadata["title"])
                if metadata.get("date"):
                    result["date"] = metadata["date"]
                    result["_is_fallback"] = False
            except Exception as e:
                print(f"    WARNING: {e}")
        enriched.append(result)

    return enriched


def fetch_pdfs(n_press=10, n_notices=10):
    """Walk backward through months to collect press releases and construction notices."""
    print("Fetching press releases and construction notices...")
    press, notices, unclassified = [], [], []

    now = datetime.now()
    year, month = now.year, now.month

    for _ in range(MAX_MONTHS_LOOKBACK):
        if len(press) >= n_press and len(notices) >= n_notices:
            break

        for furl in fetch_wp_directory(year, month):
            fname = furl.rsplit("/", 1)[-1]
            fname_lower = fname.lower()

            if not fname_lower.endswith(".pdf"):
                ext = "." + fname.rsplit(".", 1)[-1].lower() if "." in fname else ""
                if ext not in IMAGE_EXTENSIONS and fname:
                    unclassified.append(furl)
                continue

            folder_date = f"{year:04d}-{month:02d}-01"
            if "release" in fname_lower or "statement" in fname_lower:
                if len(press) < n_press:
                    press.append({"title": pdf_filename_to_title(fname), "date": folder_date, "link": furl, "_is_fallback": True})
            elif "construction-notice" in fname_lower:
                if len(notices) < n_notices:
                    notices.append({"title": pdf_filename_to_title(fname), "date": folder_date, "link": furl, "_is_fallback": True})
            elif not any(p in fname_lower for p in IGNORED_PDF_PATTERNS):
                unclassified.append(furl)

        month -= 1
        if month == 0:
            month, year = 12, year - 1

    print(f"  → {len(press)} press releases, {len(notices)} construction notices")
    return press, notices, unclassified


# ── Video gallery ─────────────────────────────────────────────────────────────

class VideoGalleryParser(HTMLParser):
    """Parse WordPress YouTube embed iframes from the GDC video gallery page.

    Targets: <iframe src="https://www.youtube.com/embed/{videoId}..." title="{title}">
    inside <figure class="wp-block-embed-youtube ...">
    """

    def __init__(self):
        super().__init__()
        self.videos = []
        self._in_embed = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "figure" and "wp-block-embed-youtube" in attrs.get("class", ""):
            self._in_embed = True
        elif tag == "iframe" and self._in_embed:
            src = attrs.get("src", "")
            title = normalize(html_module.unescape(attrs.get("title", "").strip()))
            m = re.search(r"youtube\.com/embed/([a-zA-Z0-9_-]{11})", src)
            if m and title:
                self.videos.append({"videoId": m.group(1), "title": title})
            self._in_embed = False

    def handle_endtag(self, tag):
        if tag == "figure":
            self._in_embed = False


def fetch_video_upload_date(video_id):
    """Fetch the upload date for a YouTube video by scraping its watch page.

    Returns a YYYY-MM-DD string, or None on failure.
    """
    url = f"https://www.youtube.com/watch?v={video_id}"
    raw, err = fetch_url(url)
    if err:
        return None
    m = re.search(r'"uploadDate"\s*:\s*"([^"]+)"', raw)
    if m:
        return m.group(1)[:10]  # YYYY-MM-DD
    return None


def fetch_videos(existing, limit=10):
    """Scrape YouTube video IDs and titles from the GDC video gallery page,
    then fetch upload dates from each video's watch page for new entries.
    """
    print("Fetching video gallery...")
    html_content, err = fetch_url(VIDEO_GALLERY_URL)
    if err:
        print(f"  ERROR: {err}")
        return []

    parser = VideoGalleryParser()
    parser.feed(html_content)
    raw_videos = parser.videos[:limit]
    print(f"  → {len(raw_videos)} videos found")

    videos = []
    for v in raw_videos:
        if v["videoId"] in existing:
            date = existing[v["videoId"]]["date"]
        else:
            print(f"  fetching date: {v['videoId']}")
            date = fetch_video_upload_date(v["videoId"]) or datetime.now().strftime("%Y-%m-%d")
        videos.append({"videoId": v["videoId"], "title": v["title"], "date": date})

    return videos


# ── JSON writer ───────────────────────────────────────────────────────────────

def write_data_file(photos, posts, press_releases, notices, videos):
    data = {
        "images": photos,
        "blueskyPosts": posts,
        "pressReleases": press_releases,
        "constructionNotices": notices,
        "youtubeVideos": videos,
    }
    DATA_FILE.write_text(json.dumps(data, indent=2) + "\n")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Ignore cache and re-enrich all entries")
    args = parser.parse_args()

    if not DATA_FILE.parent.exists():
        print(f"ERROR: Could not find output directory {DATA_FILE.parent}", file=sys.stderr)
        sys.exit(1)

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"]) if os.environ.get("ANTHROPIC_API_KEY") else None
    existing = {} if args.force else load_existing_data()

    posts = fetch_bluesky_posts()
    videos = fetch_videos(existing)

    gallery_photos = fetch_photos()
    dates_needing_review = []
    photos = []

    new_photo_indices = [i for i, p in enumerate(gallery_photos) if p["url"] not in existing]

    if client and new_photo_indices:
        print("Inferring photo dates...")
        fnames = [gallery_photos[i]["url"].rsplit("/", 1)[-1] for i in new_photo_indices]
        try:
            raw_dates = llm_infer_dates_from_filenames(client, fnames)
            llm_dates = {new_photo_indices[i]: raw_dates[i] for i in range(len(new_photo_indices))}
        except Exception as e:
            print(f"  WARNING: {e}, falling back to filename patterns")
            llm_dates = {}
    else:
        llm_dates = {}

    for i, p in enumerate(gallery_photos):
        fy, fm = year_month_from_url(p["url"])
        if p["url"] in existing:
            date_str, is_fallback = existing[p["url"]]["date"], False
        elif i in llm_dates and llm_dates[i][0]:
            date_str, is_fallback = llm_dates[i]
        else:
            date_str, is_fallback = infer_date_from_filename(p["url"].rsplit("/", 1)[-1], fy, fm)
        if is_fallback:
            dates_needing_review.append(("photo", p["url"], date_str))
        photos.append({"url": p["url"], "caption": p.get("caption", ""), "date": date_str})

    press_releases, notices, unclassified = fetch_pdfs()

    print("Enriching press releases...")
    press_releases = enrich_pdfs(press_releases, client, existing)
    press_releases = filter_date_mismatches(press_releases, "press releases")
    print("Enriching construction notices...")
    notices = enrich_pdfs(notices, client, existing)
    notices = filter_date_mismatches(notices, "construction notices")

    # Flag any PDF whose date is still a fallback after enrichment
    for kind, entries in (("press", press_releases), ("notice", notices)):
        for entry in entries:
            if entry.get("_is_fallback"):
                dates_needing_review.append((kind, entry["link"], entry["date"]))

    # Strip internal tracking fields before rendering
    press_releases = [{k: v for k, v in e.items() if not k.startswith("_")} for e in press_releases]
    notices = [{k: v for k, v in e.items() if not k.startswith("_")} for e in notices]

    print(f"\nWriting {DATA_FILE}...")
    write_data_file(photos, posts, press_releases, notices, videos)
    print("  → Done")

    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Bluesky posts:         {len(posts)}")
    print(f"  Photos:                {len(photos)}")
    print(f"  Press releases:        {len(press_releases)}")
    print(f"  Construction notices:  {len(notices)}")
    print(f"  YouTube videos:        {len(videos)}")

    if dates_needing_review:
        print()
        print(f"DATES NEEDING REVIEW  ({len(dates_needing_review)} item(s))")
        print("  Date was inferred from the month folder only — verify and correct manually.")
        for kind, url, date in dates_needing_review:
            print(f"  [{kind:7s}] {url.rsplit('/', 1)[-1]}")
            print(f"             → set to {date}")

    if unclassified:
        print()
        print(f"UNCLASSIFIED FILES  ({len(unclassified)} item(s))")
        print("  Found in upload directories but not matched to any category.")
        for u in unclassified:
            print(f"  {u}")

    print()


if __name__ == "__main__":
    main()
