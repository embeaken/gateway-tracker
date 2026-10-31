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
Set HUDSON_TUBE_ANTHROPIC_API_KEY for LLM-powered title/date extraction and
classification of PDFs whose filenames don't match any known pattern.

Options:
    --force               ignore all caches and re-enrich everything
    --summary-file PATH   also write the run summary as Markdown (used as the PR body)
"""

import html as html_module
import io
import json
import os
import re
import sys
from datetime import datetime
from email.utils import parsedate_to_datetime
from zoneinfo import ZoneInfo
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urljoin, urlparse
from urllib.request import Request, urlopen

import anthropic
import pypdf

# ── Config ────────────────────────────────────────────────────────────────────

ACTOR = "gatewayprogram.bsky.social"
GALLERY_URL = "https://www.gatewayprogram.org/photo-gallery.html"
SITE_URL = "https://www.gatewayprogram.org"
VIDEO_GALLERY_URL = "https://www.gatewayprogram.org/video-gallery.html"

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_FILE = SCRIPT_DIR.parent / "src" / "assets" / "activityData.json"
# Title/date/category for every PDF read so far (see "PDF index" below)
PDF_INDEX_FILE = SCRIPT_DIR / "data" / "pdf-index.json"

LLM_MODEL = "claude-sonnet-5-5"


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"}

FEED_ITEM_LIMIT = 100
MAX_MONTHS_LOOKBACK = 60

# PDF filename substrings matched against lowercase filename. These are a fast
# path only. Order matters in fetch_pdfs: press releases checked first, then
# construction notices, then the ignore list. Anything unmatched is read and
# classified by the LLM (GDC's filenames are inconsistent: "CN-...",
# "TBM-Mining-Starting_...", "...-Look-Ahead-..." all slipped past these lists).
PRESS_RELEASE_PATTERNS = (
    "release",        # GDC press releases
    "statement",      # GDC statements
    "gazette",        # GDC Gazette quarterly newsletter
    "complaint",      # federal court filings (e.g. COFC complaint)
)

CONSTRUCTION_NOTICE_PATTERNS = (
    "construction-notice",
    "parking-restriction",   # parking closures around construction sites
    "upcoming-activity",     # site activity advisories
    "safety-alert",          # boater/pedestrian safety alerts tied to construction
    "faq",                   # project-impact FAQs (Bike-Ped, Manhattan, etc.)
    "one-pager",             # community-facing explainers for active work
    "trenching",             # activity-named notices (e.g. Utility-Trenching)
)

# Skipped without an LLM call: governance docs, HR listings, forms
IGNORED_PDF_PATTERNS = (
    "board",          # board meetings, agendas, presentations, minutes
    "agenda",
    "minutes",
    "public-comment",
    "publiccomment",
    "public-mins",
    "public-session",
    "resolution",
    "-jd.pdf",        # "-JD.pdf" suffix on job descriptions
    "job-posting",
    "job-id",
    "irma-letter",    # SEC Municipal Advisor Rule compliance letter
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

# Identify ourselves to every upstream (GDC, Bluesky, YouTube, EarthCam, ...)
USER_AGENT = "hudson.tube"

def fetch_url(url, as_json=False):
    """Fetch a URL as text or JSON. Returns (content, error_string)."""
    req = Request(url, headers={"User-Agent": USER_AGENT})
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
    """Fetch a URL as raw bytes. Returns (bytes, last_modified, error_string);
    last_modified is the Last-Modified header, or None."""
    req = Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urlopen(req, timeout=30) as resp:
            return resp.read(), resp.headers.get("Last-Modified"), None
    except Exception as e:
        return None, None, str(e)


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

def folder_fallback_date(year, month):
    """Date for a file whose date can't be inferred: today (New York) if it sits
    in this month's upload folder, since it was most likely just published;
    otherwise the first of its folder's month."""
    today = datetime.now(ZoneInfo("America/New_York")).date()
    if (year, month) == (today.year, today.month):
        return today.isoformat()
    return f"{year:04d}-{month:02d}-01"


def upload_date(last_modified, year, month):
    """The day (New York) a file was uploaded, from its Last-Modified header.
    Only trusted when it falls in the file's upload folder month: anything else
    means the server reset it (or the header is missing). Returns None then."""
    if not last_modified:
        return None
    try:
        date = parsedate_to_datetime(last_modified).astimezone(ZoneInfo("America/New_York")).date()
    except (TypeError, ValueError):
        return None
    return date.isoformat() if (date.year, date.month) == (year, month) else None


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
    return folder_fallback_date(fallback_year, fallback_month), True


def year_month_from_url(url):
    """Extract (year, month) from a wp-content/uploads/YYYY/MM/ URL."""
    try:
        parts = url.split("/uploads/", 1)[1].split("/")
        return int(parts[0]), int(parts[1])
    except (IndexError, ValueError):
        now = datetime.now()
        return now.year, now.month


def filter_date_mismatches(entries, kind):
    """Drop entries whose LLM-extracted date is after the upload folder month.

    Uploads happen after document creation, so an extracted date earlier than
    the folder is legitimate (republished older docs). But a date later than
    the folder means the LLM misread; a document can't be issued after it
    was uploaded. Folder-date fallbacks are left alone since the date IS the
    folder date.
    """
    kept, skipped = [], []
    for e in entries:
        if e.get("_is_fallback", True):
            kept.append(e)
            continue
        folder_year, folder_month = year_month_from_url(e["link"])
        try:
            item_year = int(e["date"][:4])
            item_month = int(e["date"][5:7])
        except (ValueError, IndexError):
            kept.append(e)
            continue
        if (item_year, item_month) > (folder_year, folder_month):
            skipped.append((e, (folder_year, folder_month)))
        else:
            kept.append(e)
    if skipped:
        print(f"  Skipped {len(skipped)} {kind} (extracted date after upload folder):")
        for e, (fy, fm) in skipped:
            fname = e["link"].rsplit("/", 1)[-1]
            print(f"    {fname}")
            print(f"      extracted date: {e['date']} - folder: {fy:04d}-{fm:02d}")
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


def fetch_bluesky_posts(limit=FEED_ITEM_LIMIT):
    print("Fetching Bluesky posts...")
    request_limit = max(1, min(limit, 100))

    posts = []
    cursor = None
    while len(posts) < limit:
        params = {"actor": ACTOR, "limit": request_limit, "filter": "posts_no_replies"}
        if cursor:
            params["cursor"] = cursor
        url = (
            "https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed"
            f"?{urlencode(params)}"
        )
        data, err = fetch_url(url, as_json=True)
        if err:
            print(f"  ERROR: {err}")
            break

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

        cursor = data.get("cursor")
        if not cursor or not data.get("feed"):
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
                self._current_url = urljoin(GALLERY_URL, href)
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


def fetch_photos(limit=FEED_ITEM_LIMIT):
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


# ── Site upload scraping ──────────────────────────────────────────────

class LinkParser(HTMLParser):
    """Collect every <a href> on a page."""

    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            href = dict(attrs).get("href", "")
            if href:
                self.links.append(href)


def page_links(page_url):
    """Absolute link URLs (without fragments) on a page, or []."""
    html_content, err = fetch_url(page_url)
    if err or not html_content:
        return []
    parser = LinkParser()
    parser.feed(html_content)
    return [urljoin(page_url, h).split("#")[0] for h in parser.links]


def collect_site_uploads(known_urls=()):
    """Group upload files by (year, month) of their wp-content/uploads folder.

    GDC no longer serves directory listings (403), so files are found from the
    links on the site's own pages (the home page and every page it links to).
    `known_urls` (the PDF index) are added too, so a file GDC stops linking
    keeps its place in the feed.
    """
    site_host = urlparse(SITE_URL).netloc
    pages = {u for u in page_links(SITE_URL + "/") if urlparse(u).netloc == site_host and u.endswith(".html")}
    pages.add(SITE_URL + "/index.html")
    urls = set(known_urls)
    for page in sorted(pages):
        urls.update(u for u in page_links(page) if "/wp-content/uploads/" in u)

    by_month = {}
    for u in sorted(urls):
        try:
            ym = year_month_from_url(u)
        except (IndexError, ValueError):
            continue
        by_month.setdefault(ym, []).append(u)
    return by_month


def pdf_filename_to_title(filename):
    """Derive a human-readable title from a PDF filename."""
    name = filename
    if name.lower().endswith(".pdf"):
        name = name[:-4]
    name = name.replace("-", " ").replace("_", " ")
    return " ".join(name.split()).title()


# ── PDF index ─────────────────────────────────────────────────────────────────
#
# Every PDF the script has read, keyed by URL:
#   {"category", "title", "date", "dateIsFallback", "classifiedBy"}
# plus "dateFrom": "upload" when a fallback date is the file's upload day
# (its Last-Modified header) rather than a guess from the folder.
# category is one of PDF_CATEGORIES. classifiedBy is "filename" when a pattern
# above decided it, "llm" when the model did. "other" entries never reach
# activityData.json; they're kept so each file is only downloaded and read once.

PDF_CATEGORIES = ("press_release", "construction_notice", "other")


def extract_pdf_text(pdf_bytes):
    """Extract plain text from the first few pages of a PDF."""
    reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
    return "\n".join(page.extract_text() or "" for page in reader.pages[:4])


def llm_text(message):
    """The text of a Messages API response, skipping any thinking blocks."""
    return next(b.text for b in message.content if b.type == "text").strip()


CATEGORY_GUIDE = """Categories:
- "construction_notice": community-facing notices about construction work and its
  local impacts. Includes work notices, monthly look-aheads, site mobilization and
  upcoming-activity notices, start-of-tunneling notices, lane/road/sidewalk closures,
  parking restrictions, boater safety alerts, and FAQs about construction impacts.
- "press_release": press releases, official statements, newsletters, and court
  filings announced by GDC.
- "other": everything else. Includes board meeting materials (agendas, decks,
  minutes, resolutions), procurement documents (RFQs, shortlists, DBE goals),
  reports, budgets, policies, explainers, job postings, forms, and Spanish-only
  duplicates of English documents."""


def llm_read_pdf(client, text, filename, classify):
    """Ask the LLM for a PDF's title and date, plus its category when `classify`.

    Returns a dict with "title", "date" and (when classifying) "category".
    """
    category_field = (
        '- "category": one of "construction_notice", "press_release", "other"\n'
        if classify else ""
    )
    prompt = f"""This PDF was posted on the Gateway Development Commission's website
(the agency building the Hudson Tunnel Project). Extract its {"category, " if classify else ""}title
and date for a public activity feed.

Filename: {filename}

Document text:
{text[:4000]}

{CATEGORY_GUIDE if classify else ""}

Return a JSON object with exactly these fields:
{category_field}- "title": a concise, human-readable title that identifies the document well enough
  to stand alone in a list. Use title case. Prefer the document's own subject
  heading over the filename. AVOID bare generic labels like "Complaint",
  "Statement", "Press Release", or "Notice" - expand them so the reader can
  tell what the document is about.
    * If the document IS itself a court filing (complaint, motion, brief, or
      other pleading filed with a court - not a press release discussing one),
      format as: "{{filing type}}: {{plaintiff}} v. {{defendant}} ({{court}})".
      Example: "Complaint: Gateway Development Commission v. United States (U.S. Court of Federal Claims)".
    * For press releases and statements (including those about lawsuits),
      use the headline if present; otherwise summarize the subject.
- "date": the date the document was issued, in YYYY-MM-DD format, or null if the
  document doesn't state one. Don't guess.

Return only the JSON object, no other text."""

    message = client.messages.create(
        model=LLM_MODEL,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = llm_text(message)
    m = re.search(r"\{.*\}", raw, re.DOTALL)
    if not m:
        raise ValueError(f"no JSON in LLM response: {raw!r}")
    result = json.loads(m.group())
    if classify and result.get("category") not in PDF_CATEGORIES:
        raise ValueError(f"unknown category in LLM response: {raw!r}")
    return result


def pattern_category(fname_lower):
    """Category from filename patterns: a PDF_CATEGORIES value, "skip", or None."""
    if any(p in fname_lower for p in PRESS_RELEASE_PATTERNS):
        return "press_release"
    if any(p in fname_lower for p in CONSTRUCTION_NOTICE_PATTERNS):
        return "construction_notice"
    if any(p in fname_lower for p in IGNORED_PDF_PATTERNS):
        return "skip"
    return None


def read_pdf(furl, category, client):
    """Download a PDF and build its index entry. Returns None on failure."""
    fname = furl.rsplit("/", 1)[-1]
    year, month = year_month_from_url(furl)
    print(f"  reading:   {fname}")
    try:
        pdf_bytes, last_modified, err = fetch_bytes(furl)
        if err:
            raise RuntimeError(f"download failed: {err}")
        result = llm_read_pdf(client, extract_pdf_text(pdf_bytes), fname, classify=category is None)
    except Exception as e:
        print(f"    WARNING: {e}")
        return None
    date = result.get("date") or ""
    has_date = bool(re.match(r"^\d{4}-\d{2}-\d{2}$", date))
    uploaded = None if has_date else upload_date(last_modified, year, month)
    entry = {
        "category": category or result["category"],
        "title": normalize(result.get("title") or pdf_filename_to_title(fname)),
        "date": date if has_date else uploaded or folder_fallback_date(year, month),
        "dateIsFallback": not has_date,
        "classifiedBy": "filename" if category else "llm",
    }
    if uploaded:
        entry["dateFrom"] = "upload"
    return entry


def load_pdf_index():
    """Load the PDF index, seeding it from activityData.json on first run."""
    if PDF_INDEX_FILE.exists():
        try:
            return json.loads(PDF_INDEX_FILE.read_text())
        except Exception as e:
            print(f"  WARNING: could not parse {PDF_INDEX_FILE.name}: {e}")
            return {}
    if not DATA_FILE.exists():
        return {}
    data = json.loads(DATA_FILE.read_text())
    index = {}
    for key, category in (("pressReleases", "press_release"), ("constructionNotices", "construction_notice")):
        for item in data.get(key, []):
            index[item["link"]] = {
                "category": category,
                "title": item["title"],
                "date": item["date"],
                "dateIsFallback": is_folder_date_fallback(item),
                "classifiedBy": "filename",
            }
    return index


def save_pdf_index(index):
    clean = {
        url: {k: v for k, v in entry.items() if not k.startswith("_")}
        for url, entry in sorted(index.items())
    }
    PDF_INDEX_FILE.parent.mkdir(parents=True, exist_ok=True)
    PDF_INDEX_FILE.write_text(json.dumps(clean, indent=2) + "\n")


def llm_infer_dates_from_filenames(client, filenames):
    """Ask Claude to batch-extract dates from a list of filenames.

    Returns a list of (date_str | None, is_fallback) in the same order as input.
    date_str is None if Claude couldn't determine any date.
    """
    numbered = "\n".join(f"{i + 1}. {f}" for i, f in enumerate(filenames))
    prompt = f"""Extract the date from each filename. Filenames may use various formats (YYYYMMDD, YYYY-MM-DD, YYYY.MM.DD, MM-DD-YYYY, Month-D-YYYY, etc.).

{numbered}

Return a JSON array with one object per filename (in the same order):
- "date": the date in YYYY-MM-DD format, or null if no date can be determined. A year alone (e.g. "2026" in "Notice-2026-V4") is not a date: return null
- "exact": true if a full year/month/day was found; false if only year/month (use 01 for the missing day)

Return only the JSON array, no other text."""

    message = client.messages.create(
        model=LLM_MODEL,
        max_tokens=8192,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = llm_text(message)
    match = re.search(r"\[.*\]", raw, re.DOTALL)
    if not match:
        raise ValueError(f"no JSON array in LLM response: {raw!r}")
    results = json.loads(match.group())
    return [(r.get("date"), not r.get("exact", False)) for r in results]


def fill_dates_from_filenames(entries, client, index):
    """For entries still using folder-date fallback, try extracting a better
    date from the filename. Many PDFs encode the issue date in the filename
    (e.g. `3.24.2026_...`, `2026.3.30_...`, `3_9_26-PPR.pdf`) even when the
    PDF body lacks an explicit issue date. Mutates entries and the index in-place.
    """
    if not client:
        return entries
    needs_date = [(i, e) for i, e in enumerate(entries) if e.get("_is_fallback")]
    if not needs_date:
        return entries
    fnames = [e["link"].rsplit("/", 1)[-1] for _, e in needs_date]
    print(f"  Inferring dates from filenames for {len(needs_date)} item(s)...")
    try:
        results = llm_infer_dates_from_filenames(client, fnames)
    except Exception as ex:
        print(f"  WARNING: filename date inference failed: {ex}")
        return entries
    for (i, _), (date, is_fallback) in zip(needs_date, results):
        if date and re.match(r"^\d{4}-\d{2}-\d{2}$", date):
            if is_fallback and entries[i].get("_date_from") == "upload":
                continue  # the upload day beats a month-only guess
            if is_fallback and date[:7] == "%04d-%02d" % year_month_from_url(entries[i]["link"]):
                continue  # month-only guess in the folder's own month: keep the folder fallback
            entries[i]["date"] = date
            entries[i]["_is_fallback"] = is_fallback
            if not is_fallback and entries[i]["link"] in index:
                index[entries[i]["link"]].update(date=date, dateIsFallback=False)
                index[entries[i]["link"]].pop("dateFrom", None)
            entries[i].pop("_date_from", None)
    return entries


def is_folder_date_fallback(entry):
    """Return True when a cached PDF date is just its upload folder month."""
    try:
        folder_year, folder_month = year_month_from_url(entry["link"])
    except KeyError:
        return False
    return entry.get("date") == f"{folder_year:04d}-{folder_month:02d}-01"


def fetch_pdfs(client, index, n_press=FEED_ITEM_LIMIT, n_notices=FEED_ITEM_LIMIT):
    """Walk backward through monthly upload folders collecting press releases and
    construction notices, reading any PDF not already in the index.

    Whole folders are processed even once the caps are reached, because GDC
    sometimes re-uploads years of old documents into a single month. The caller
    sorts by date and trims, so the newest items win.
    """
    print("Fetching press releases and construction notices...")
    press, notices, unclassified = [], [], []

    uploads = collect_site_uploads(index.keys())

    now = datetime.now()
    year, month = now.year, now.month

    for _ in range(MAX_MONTHS_LOOKBACK):
        if len(press) >= n_press and len(notices) >= n_notices:
            break

        for furl in uploads.get((year, month), []):
            fname = furl.rsplit("/", 1)[-1]
            fname_lower = fname.lower()

            if not fname_lower.endswith(".pdf"):
                # Videos, zips etc. are worth a human look, but only in recent
                # folders; older ones are mostly archive dumps.
                ext = "." + fname.rsplit(".", 1)[-1].lower() if "." in fname else ""
                if ext not in IMAGE_EXTENSIONS and fname and now.year * 12 + now.month - (year * 12 + month) <= 2:
                    unclassified.append(furl)
                continue

            category = pattern_category(fname_lower)
            if category == "skip":
                continue

            if furl in index:
                entry = index[furl]
            elif client:
                entry = read_pdf(furl, category, client)
                if entry is None:
                    unclassified.append(furl)
                    continue
                index[furl] = {**entry, "_new": True}
            elif category:
                entry = {
                    "category": category,
                    "title": pdf_filename_to_title(fname),
                    "date": folder_fallback_date(year, month),
                    "dateIsFallback": True,
                }
            else:
                unclassified.append(furl)
                continue

            item = {"title": entry["title"], "date": entry["date"], "link": furl, "_is_fallback": entry["dateIsFallback"]}
            if entry.get("dateFrom"):
                item["_date_from"] = entry["dateFrom"]
            if entry["category"] == "press_release":
                press.append(item)
            elif entry["category"] == "construction_notice":
                notices.append(item)

        month -= 1
        if month == 0:
            month, year = 12, year - 1

    print(f"  → {len(press)} press releases, {len(notices)} construction notices found")
    return press, notices, unclassified


def newest(entries, limit):
    """Newest `limit` entries, dropping re-uploads (same title and date).

    GDC often posts the same document twice (`foo.pdf` and `foo-1.pdf`). The
    walk goes newest folder first, so the first copy seen is kept.
    """
    seen, unique = set(), []
    for e in entries:
        key = (e["title"].casefold(), e["date"])
        if key not in seen:
            seen.add(key)
            unique.append(e)
    return sorted(unique, key=lambda e: e["date"], reverse=True)[:limit]


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


def fetch_videos(existing, limit=FEED_ITEM_LIMIT):
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
            date = fetch_video_upload_date(v["videoId"])
            if not date:
                # Private or removed videos stay embedded on GDC's page but have
                # no upload date. Skip rather than dating them today; a later run retries.
                print(f"    WARNING: no upload date for {v['videoId']} (private or removed?), skipping")
                continue
        videos.append({"videoId": v["videoId"], "title": v["title"], "date": date})

    return videos


# ── JSON writer ───────────────────────────────────────────────────────────────

def diff_data(old_json, new_data):
    """Compare old JSON (dict from file) with new data dict.

    Returns a list of human-readable change lines, or [] if nothing changed.
    """
    if not old_json:
        return ["  (no previous data — treating everything as new)"]

    sections = [
        ("images",              "url",     "Photos"),
        ("blueskyPosts",        "link",    "Bluesky posts"),
        ("pressReleases",       "link",    "Press releases"),
        ("constructionNotices", "link",    "Construction notices"),
        ("youtubeVideos",       "videoId", "YouTube videos"),
    ]
    lines = []

    for section_key, id_field, label in sections:
        old_items = {item[id_field]: item for item in old_json.get(section_key, [])}
        new_items = {item[id_field]: item for item in new_data.get(section_key, [])}

        added   = [k for k in new_items if k not in old_items]
        removed = [k for k in old_items if k not in new_items]
        changed = [
            k for k in new_items
            if k in old_items and new_items[k] != old_items[k]
        ]

        if added or removed or changed:
            lines.append(f"  {label}:")
            for k in added:
                name = k.rsplit("/", 1)[-1]
                lines.append(f"    + {name}")
            for k in removed:
                name = k.rsplit("/", 1)[-1]
                lines.append(f"    - {name}")
            for k in changed:
                name = k.rsplit("/", 1)[-1]
                old, new = old_items[k], new_items[k]
                diff_fields = [f for f in set(old) | set(new) if old.get(f) != new.get(f)]
                lines.append(f"    ~ {name}  ({', '.join(diff_fields)})")

    return lines


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Ignore caches and re-enrich all entries")
    parser.add_argument("--summary-file", type=Path, help="Also write the run summary as Markdown")
    args = parser.parse_args()

    if not DATA_FILE.parent.exists():
        print(f"ERROR: Could not find output directory {DATA_FILE.parent}", file=sys.stderr)
        sys.exit(1)

    client = anthropic.Anthropic(api_key=os.environ["HUDSON_TUBE_ANTHROPIC_API_KEY"]) if os.environ.get("HUDSON_TUBE_ANTHROPIC_API_KEY") else None
    existing = {} if args.force else load_existing_data()
    pdf_index = {} if args.force else load_pdf_index()

    posts = fetch_bluesky_posts(limit=FEED_ITEM_LIMIT)
    videos = fetch_videos(existing, limit=FEED_ITEM_LIMIT)

    gallery_photos = fetch_photos(limit=FEED_ITEM_LIMIT)
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
        elif i in llm_dates and llm_dates[i][0] and not (
            llm_dates[i][1] and llm_dates[i][0][:7] == f"{fy:04d}-{fm:02d}"
        ):
            date_str, is_fallback = llm_dates[i]
        else:
            date_str, is_fallback = infer_date_from_filename(p["url"].rsplit("/", 1)[-1], fy, fm)
        if is_fallback:
            dates_needing_review.append(("photo", p["url"], date_str, "folder month"))
        photos.append({"url": p["url"], "caption": p.get("caption", ""), "date": date_str})

    press_releases, notices, unclassified = fetch_pdfs(client, pdf_index)

    print("Dating press releases...")
    press_releases = fill_dates_from_filenames(press_releases, client, pdf_index)
    press_releases = newest(filter_date_mismatches(press_releases, "press releases"), FEED_ITEM_LIMIT)
    print("Dating construction notices...")
    notices = fill_dates_from_filenames(notices, client, pdf_index)
    notices = newest(filter_date_mismatches(notices, "construction notices"), FEED_ITEM_LIMIT)

    # Flag any PDF whose date is still a fallback after enrichment
    for kind, entries in (("press", press_releases), ("notice", notices)):
        for entry in entries:
            if entry.get("_is_fallback"):
                source = "upload date" if entry.get("_date_from") == "upload" else "folder month"
                dates_needing_review.append((kind, entry["link"], entry["date"], source))

    # Strip internal tracking fields before rendering
    press_releases = [{k: v for k, v in e.items() if not k.startswith("_")} for e in press_releases]
    notices = [{k: v for k, v in e.items() if not k.startswith("_")} for e in notices]

    # Load old data for diff before overwriting
    old_json = json.loads(DATA_FILE.read_text()) if DATA_FILE.exists() else None

    print(f"\nWriting {DATA_FILE}...")
    new_data = {
        "images": photos,
        "blueskyPosts": posts,
        "pressReleases": press_releases,
        "constructionNotices": notices,
        "youtubeVideos": videos,
    }
    DATA_FILE.write_text(json.dumps(new_data, indent=2) + "\n")
    save_pdf_index(pdf_index)
    print("  → Done")

    newly_read = [(url, v) for url, v in pdf_index.items() if v.get("_new")]

    change_lines = diff_data(old_json, new_data)

    report = build_report(
        counts={
            "Bluesky posts": len(posts),
            "Photos": len(photos),
            "Press releases": len(press_releases),
            "Construction notices": len(notices),
            "YouTube videos": len(videos),
        },
        change_lines=change_lines,
        newly_read=newly_read,
        dates_needing_review=dates_needing_review,
        unclassified=unclassified,
    )
    print()
    print(report)
    if args.summary_file:
        args.summary_file.write_text(report + "\n")


def build_report(counts, change_lines, newly_read, dates_needing_review, unclassified):
    """Markdown-flavored run summary, printed to stdout and used as the PR body."""
    out = ["## Summary", ""]
    out += [f"- {label}: {n}" for label, n in counts.items()]

    out += ["", "## Changes", ""]
    if change_lines:
        out += ["```", *change_lines, "```"]
    else:
        out.append("No changes. Data is up to date.")

    by_llm = [(u, v) for u, v in newly_read if v["classifiedBy"] == "llm"]
    if by_llm:
        labels = {"press_release": "press release", "construction_notice": "construction notice", "other": "not in feed (other)"}
        out += [
            "",
            f"## Classified by the LLM ({len(by_llm)})",
            "",
            "These filenames matched no pattern, so the model read them and decided.",
            f"Fix a wrong verdict by editing its `category` in `scripts/data/{PDF_INDEX_FILE.name}`.",
            "",
        ]
        for url, v in by_llm:
            date = "no date" if v["dateIsFallback"] else v["date"]
            out.append(f"- **{labels[v['category']]}**: [{v['title']}]({url}) ({date})")

    if dates_needing_review:
        out += [
            "",
            f"## Dates needing review ({len(dates_needing_review)})",
            "",
            "These files state no date. An upload date is the day the file was posted",
            "(its Last-Modified header): usually right. A folder month is only a guess:",
            "the first of the month, or the day of the run for this month's folder.",
            "Verify and correct manually.",
            "",
        ]
        for kind, url, date, source in dates_needing_review:
            out.append(f"- [{kind}] `{url.rsplit('/', 1)[-1]}` → {date} ({source})")

    if unclassified:
        out += [
            "",
            f"## Unclassified files ({len(unclassified)})",
            "",
            "Found in upload directories but not classified (no API key, a failed download, or not a PDF).",
            "",
        ]
        out += [f"- {u}" for u in unclassified]

    return "\n".join(out)


if __name__ == "__main__":
    main()
