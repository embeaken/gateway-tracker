#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "pypdf>=5.0",
#   "anthropic>=0.40",
# ]
# ///
"""update_data.py — Fetch fresh data from all sources and rewrite activityData.ts

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
from string import Template
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import anthropic
import pypdf

# ── Config ────────────────────────────────────────────────────────────────────

ACTOR = "gatewayprogram.bsky.social"
GALLERY_URL = "https://www.gatewayprogram.org/photo-gallery.html"
UPLOAD_BASE = "https://www.gatewayprogram.org/wp-content/uploads"

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_FILE = SCRIPT_DIR.parent / "src" / "assets" / "activityData.ts"

MONTH_NAMES = {
    "january": 1, "february": 2, "march": 3, "april": 4,
    "may": 5, "june": 6, "july": 7, "august": 8,
    "september": 9, "october": 10, "november": 11, "december": 12,
}

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


# ── Date inference ────────────────────────────────────────────────────────────

def infer_date_from_filename(filename, fallback_year, fallback_month):
    """Try to extract a YYYY-MM-DD date from a filename.

    Returns (date_str, is_fallback). Falls back to the first of the month
    derived from the upload directory path if no date pattern matches.
    """
    # Pattern 1: YYYYMMDD  (e.g. PKG1A_PH_20260129_...)
    m = re.search(r"(\d{4})(\d{2})(\d{2})", filename)
    if m:
        y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if 2010 <= y <= 2040 and 1 <= mo <= 12 and 1 <= d <= 31:
            return f"{y:04d}-{mo:02d}-{d:02d}", False

    # Pattern 2: Month_DD_YYYY  (e.g. January_28_2026)
    m = re.search(
        r"(january|february|march|april|may|june|july|august|"
        r"september|october|november|december)[\s_\-](\d{1,2})[\s_\-](\d{4})",
        filename, re.IGNORECASE,
    )
    if m:
        mo = MONTH_NAMES[m.group(1).lower()]
        d, y = int(m.group(2)), int(m.group(3))
        if 1 <= d <= 31:
            return f"{y:04d}-{mo:02d}-{d:02d}", False

    # Pattern 3: M-DD-YYYY  (e.g. 1-29-2025)
    m = re.search(r"(\d{1,2})-(\d{2})-(\d{4})", filename)
    if m:
        mo, d, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if 1 <= mo <= 12 and 1 <= d <= 31 and 2010 <= y <= 2040:
            return f"{y:04d}-{mo:02d}-{d:02d}", False

    return f"{fallback_year:04d}-{fallback_month:02d}-01", True


def year_month_from_url(url):
    """Extract (year, month) from a wp-content/uploads/YYYY/MM/ URL."""
    m = re.search(r"/(\d{4})/(\d{2})/", url)
    if m:
        return int(m.group(1)), int(m.group(2))
    now = datetime.now()
    return now.year, now.month


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
    name = re.sub(r"\.pdf$", "", filename, flags=re.IGNORECASE)
    name = re.sub(r"[-_]", " ", name)
    return re.sub(r"\s+", " ", name).strip().title()


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


def enrich_pdfs(entries):
    """Download each PDF and use an LLM to replace filename-derived title and date."""
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("  (skipping — ANTHROPIC_API_KEY not set)")
        return entries

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    enriched = []
    for entry in entries:
        fname = entry["link"].rsplit("/", 1)[-1]
        print(f"  enriching: {fname}")
        result = dict(entry)
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

            date_str, is_fallback = infer_date_from_filename(fname, year, month)
            if "press-release" in fname_lower or "statement" in fname_lower:
                if len(press) < n_press:
                    press.append({"title": pdf_filename_to_title(fname), "date": date_str, "link": furl, "_is_fallback": is_fallback})
            elif "construction-notice" in fname_lower:
                if len(notices) < n_notices:
                    notices.append({"title": pdf_filename_to_title(fname), "date": date_str, "link": furl, "_is_fallback": is_fallback})
            elif not any(p in fname_lower for p in IGNORED_PDF_PATTERNS):
                unclassified.append(furl)

        month -= 1
        if month == 0:
            month, year = 12, year - 1

    print(f"  → {len(press)} press releases, {len(notices)} construction notices")
    return press, notices, unclassified


# ── TypeScript writer ─────────────────────────────────────────────────────────

_TEMPLATE = Template("""\
export type GalleryImage = {
  url: string
  caption: string
  date: string
}

export type BlueskyPost = {
  text: string
  date: string
  link: string
  imageUrl?: string
}

export type PressRelease = {
  title: string
  date: string
  link: string
}

export type ConstructionNotice = {
  title: string
  date: string
  link: string
}

export const images: GalleryImage[] = [
${images}
]

export const blueskyPosts: BlueskyPost[] = [
${bluesky_posts}
]

export const pressReleases: PressRelease[] = [
${press_releases}
]

export const constructionNotices: ConstructionNotice[] = [
${construction_notices}
]
""")


def ts_str(s):
    """Escape a value for use in a TypeScript single-quoted string literal."""
    return s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n").replace("\r", "")


def _render_image(p):
    return "\n".join([
        "  {",
        f"    url: '{ts_str(p['url'])}',",
        f"    caption: '{ts_str(p.get('caption', ''))}',",
        f"    date: '{ts_str(p['date'])}'",
        "  },",
    ])


def _render_post(post):
    lines = [
        "  {",
        f"    text: '{ts_str(post['text'])}',",
        f"    date: '{ts_str(post['date'])}',",
        f"    link: '{ts_str(post['link'])}',",
    ]
    if "imageUrl" in post:
        lines.append(f"    imageUrl: '{ts_str(post['imageUrl'])}',")
    lines.append("  },")
    return "\n".join(lines)


def _render_doc(doc):
    return "\n".join([
        "  {",
        f"    title: '{ts_str(doc['title'])}',",
        f"    date: '{ts_str(doc['date'])}',",
        f"    link: '{ts_str(doc['link'])}'",
        "  },",
    ])


def write_data_file(photos, posts, press_releases, notices):
    content = _TEMPLATE.substitute(
        images="\n".join(_render_image(p) for p in photos),
        bluesky_posts="\n".join(_render_post(p) for p in posts),
        press_releases="\n".join(_render_doc(pr) for pr in press_releases),
        construction_notices="\n".join(_render_doc(n) for n in notices),
    )
    DATA_FILE.write_text(content)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if not DATA_FILE.exists():
        print(f"ERROR: Could not find {DATA_FILE}", file=sys.stderr)
        sys.exit(1)

    posts = fetch_bluesky_posts()

    gallery_photos = fetch_photos()
    dates_needing_review = []
    photos = []
    for p in gallery_photos:
        fname = p["url"].rsplit("/", 1)[-1]
        fy, fm = year_month_from_url(p["url"])
        date_str, is_fallback = infer_date_from_filename(fname, fy, fm)
        if is_fallback:
            dates_needing_review.append(("photo", p["url"], date_str))
        photos.append({"url": p["url"], "caption": p.get("caption", ""), "date": date_str})

    press_releases, notices, unclassified = fetch_pdfs()

    print("Enriching press releases...")
    press_releases = enrich_pdfs(press_releases)
    print("Enriching construction notices...")
    notices = enrich_pdfs(notices)

    # Flag any PDF whose date is still a fallback after enrichment
    for kind, entries in (("press", press_releases), ("notice", notices)):
        for entry in entries:
            if entry.get("_is_fallback"):
                dates_needing_review.append((kind, entry["link"], entry["date"]))

    # Strip internal tracking fields before rendering
    press_releases = [{k: v for k, v in e.items() if not k.startswith("_")} for e in press_releases]
    notices = [{k: v for k, v in e.items() if not k.startswith("_")} for e in notices]

    print(f"\nWriting {DATA_FILE}...")
    write_data_file(photos, posts, press_releases, notices)
    print("  → Done")

    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Bluesky posts:         {len(posts)}")
    print(f"  Photos:                {len(photos)}")
    print(f"  Press releases:        {len(press_releases)}")
    print(f"  Construction notices:  {len(notices)}")

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
