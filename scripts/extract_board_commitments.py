# /// script
# requires-python = ">=3.11"
# dependencies = ["httpx", "pypdf", "anthropic"]
# ///
"""Extract contract authorizations from GDC board meeting Minutes/Resolutions PDFs.

Walks every meeting on gatewayprogram.org/board-meetings-3.html, downloads the
Minutes PDF, finds each #YYMM-NN action item, pulls the resolution title and
"not to exceed" dollar amount, and writes src/assets/boardCommitments.json.

One-shot, hand-validated dataset — separate from update_data.py.
"""

import json
import os
import re
import sys
from pathlib import Path

import httpx
import pypdf

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "src" / "assets" / "boardCommitments.json"
CACHE_DIR = Path("/tmp/gdc_minutes")
CACHE_DIR.mkdir(exist_ok=True)

BOARD_INDEX_URL = "https://www.gatewayprogram.org/board-meetings-3.html"

# (meeting_date, minutes_pdf_url) — pulled from board-meetings-3.html.
# Skipping 2021–2022 meetings: those predate active construction contracts and
# the "Minutes Packet" PDFs from that era are mostly governance.
MEETINGS: list[tuple[str, str]] = [
    ("2026-04-27", "https://www.gatewayprogram.org/wp-content/uploads/2026/04/Public-Minutes-Post-Gub-Review-4-27-26.pdf"),
    ("2026-03-23", "https://www.gatewayprogram.org/wp-content/uploads/2026/04/Minutes-and-Resolutions-Post-Gub-Review-4-8-26.pdf"),
    ("2026-01-27", "https://www.gatewayprogram.org/wp-content/uploads/2026/02/Public-Session-Board-Minutes-1-27-26-Post-Gub-Review.pdf"),
    ("2025-12-15", "https://www.gatewayprogram.org/wp-content/uploads/2026/01/Public-Mins-and-Res-for-Website-Post-Gub-Review-Dec-2025.pdf"),
    ("2025-09-30", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/GDC-HTP-BOC-MINS-RES-2025.09.30-1.pdf"),
    ("2025-08-20", "https://www.gatewayprogram.org/wp-content/uploads/2025/09/Public-Session-Mins-and-Adopted-Resolutions-Post-Gub-Review-9-8-25.pdf"),
    ("2025-07-28", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/GDC-HTP-BOC-MINS-RES-2025.07.28.pdf"),
    ("2025-05-20", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/GDC-HTP-BOC-MINS-RES-2025.05.20-1.pdf"),
    ("2025-04-14", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/GDC-HTP-BOC-MINS-RES-2025.04.14.pdf"),
    ("2025-02-03", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/GDC-HTP-BOC-MINS-RES-2025.02.03.pdf"),
    ("2025-01-16", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/GDC-HTP-BOC-MINS-RES-2025.01.16.pdf"),
    ("2024-12-12", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/GDC-HTP-BOC-MINS-RES-2024.12.12-1.pdf"),
    ("2024-10-11", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/GDC-HTP-BOC-MINS-RES-2024.10.11.pdf"),
    ("2024-08-28", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/Public-Session-Board-Minutes-and-Adopted-Resolution-Final-for-Website-9-13-24-1.pdf"),
    ("2024-08-01", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/GDC-HTP-BOC-MINS-RES-2024.08.01-1.pdf"),
    ("2024-07-02", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/GDC-HTP-BOC-MINS-RES-2024.07.02.pdf"),
    ("2024-05-06", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/GDC-HTP-BOC-MINS-RES-2024.05.06-1.pdf"),
    ("2024-04-16", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/GDC-HTP-BOC-MINS-RES-2024.04.16.pdf"),
    ("2024-02-28", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/GDC-HTP-BOC-MINS-RES-2024.02.28.pdf"),
    ("2024-02-16", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/GDC-HTP-BOC-MINS-RES-2024.02.16.pdf"),
    ("2023-12-11", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/12.11.23-GDC-Final-Board-Minutes-and-Resolutions.pdf"),
    ("2023-11-16", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/11-16-23-GDC-Board-Minutes-and-Resolution-FINAL.pdf"),
    ("2023-10-16", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/10.16.23-GDC-Bd-Mtg-Minutes-Packet-FINAL.pdf"),
    ("2023-09-11", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/9-11-23-Final-Minutes-Packet.pdf"),
    ("2023-05-02", "https://www.gatewayprogram.org/wp-content/uploads/2025/10/5-2-23-GDC-Board-Minutes-and-Adopted-Resolutions-FINAL.pdf"),
]


# ─── Regex patterns ──────────────────────────────────────────────────────────

# Resolution headers look like "#0725-01:" or "Item #0725-01:" or "0725-01"
RESOLUTION_HEADER = re.compile(
    r"#\s*(\d{4}-\d{2})\s*[:\.]?\s*([A-Za-z][^\n]{5,300})"
)

# Dollar amounts: $26,823,778 / $665 Million / $1.18 billion / $1,177,700,000.00
# Captures number and optional unit word.
DOLLAR = re.compile(
    r"\$\s*([\d,]+(?:\.\d+)?)\s*(billion|million|thousand)?",
    re.IGNORECASE,
)

# Accepts both "GDC-24-005-HTP" and the older "GDC23-001" form (no hyphen
# between GDC and the year).
CONTRACT_ID = re.compile(r"GDC-?\d{2}-\d{3,4}(?:-[A-Z]+(?:-\d+)?)?", re.I)


def parse_dollar(num_str: str, unit: str | None) -> int:
    n = float(num_str.replace(",", ""))
    if unit:
        u = unit.lower()
        if u == "billion":
            n *= 1_000_000_000
        elif u == "million":
            n *= 1_000_000
        elif u == "thousand":
            n *= 1_000
    return int(round(n))


# ─── Categorization ──────────────────────────────────────────────────────────

CATEGORY_RULES: list[tuple[str, list[str]]] = [
    # GDC's own annual operating budget — distinct from project spending
    ("operating-budget", [
        "annual operating",
        "audited financial statements",
    ]),
    # MPA and successor program-management contracts (must precede other rules)
    ("delivery-partner", [
        "delivery partner", "mpa delivery", "gdc-24-005", "gdc24-005",
        "in connection with contract gdc-24-005",
    ]),
    # Federal grants, loans, and the GDC↔states funding agreements that wire
    # the federal money through to the project
    ("funding", [
        "full federal funding grant",
        "federal-state partnership",
        "federal state partnership",
        "rrif loan",
        "rrif local funding",
        "capital investment grant",
        "capital funding agreement",
        "raise grant",
        "credit facility",
        "collateral account",
        "funding agreement with the state",
        "amend funding agreement",
        "supporting or executing partner agreement",
        "past costs",
    ]),
    # Actual contracts to design or build the tunnel
    ("construction", [
        "design-build", "design build", "construction services",
        "tunnel boring", "ground stabilization", "concrete casing",
        "tonnelle", "palisades tunnel", "manhattan tunnel", "hudson river tunnel",
        "expert professional design-build",
        "construction package", "site preparation", "early works",
        "engineer of record", "owner's engineer",
        "market case estimate",
        "stipend program", "stipend",
        "notice to proceed",
        "hudson tunnel project",  # catchall for project-tagged resolutions
    ]),
    # Sourced services to support the program
    ("professional-services", [
        "advisory", "audit", "auditing", "legal services", "site security",
        "integrity monitoring", "procurement support", "insurance",
        "financial advisor", "expert business advisory", "technical advisory",
        "owner's representative", "consulting",
    ]),
]


# Resolutions whose title begins with these phrases authorize an envelope or
# a procedural step on top of an already-counted contract — including them
# in the cumulative would double-count.
DUPLICATE_PHRASES = (
    "approval of market case estimate",
    "authorization of notice to proceed",
    "authorization to increase",
    "authorization to amend the project development",
)


def normalized_contract_id(cid: str | None) -> str | None:
    if not cid:
        return None
    return re.sub(r"[^A-Z0-9]", "", cid.upper())


# Contract-ID-based classification — robust against prose titles like
# "Authorization of Delegation of Authority …" that don't name the project.
CONTRACT_ID_CATEGORY: dict[str, str] = {
    "GDC24005HTP": "delivery-partner",       # MPA Delivery Partner
    "GDC24004HTP": "construction",           # Tonnelle Avenue + utility relocation
    "GDC24006HTP": "construction",           # Palisades Tunnel
    "GDC25007HTP": "construction",           # Manhattan Tunnel
    "GDC26008HTP": "construction",           # Hudson River Tunnel (P1C)
    "GDC25029OP": "construction",            # Engineer of Record services (program-wide)
    "GDC23001": "construction",              # Early HTP design services
    "GDC23002": "construction",              # Early HTP construction services
}

# Hand-keyed overrides for resolutions whose category isn't obvious from the
# title or contract id. (meeting_date, resolution_id) → category.
RESOLUTION_OVERRIDES: dict[tuple[str, str], str] = {
    ("2024-08-28", "0824-06"): "funding",   # Federal-State Partnership grant agreement
    ("2024-07-02", "0724-01"): "funding",   # Full Federal Funding Grant Agreement
}


def categorize(title: str, contract_id: str | None) -> str:
    cid_norm = normalized_contract_id(contract_id)
    if cid_norm:
        for prefix, cat in CONTRACT_ID_CATEGORY.items():
            if cid_norm.startswith(prefix):
                return cat
    t = title.lower()
    for cat, keywords in CATEGORY_RULES:
        if any(k in t for k in keywords):
            return cat
    return "governance"


def is_duplicate(title: str) -> bool:
    t = title.lower().strip()
    return any(t.startswith(p) for p in DUPLICATE_PHRASES)


# ─── PDF helpers ─────────────────────────────────────────────────────────────


def download(url: str) -> Path:
    fname = url.rsplit("/", 1)[-1]
    p = CACHE_DIR / fname
    if not p.exists():
        print(f"  downloading {fname}...")
        r = httpx.get(url, timeout=60, follow_redirects=True)
        r.raise_for_status()
        p.write_bytes(r.content)
    return p


def extract_text(pdf_path: Path) -> str:
    r = pypdf.PdfReader(str(pdf_path))
    return "\n".join((p.extract_text() or "") for p in r.pages)


# ─── Main extraction loop ────────────────────────────────────────────────────


def extract_resolutions(meeting_date: str, url: str, text: str) -> list[dict]:
    """For one minutes PDF, return one record per unique resolution id.

    The minutes typically list each resolution twice — once briefly in the
    Action Items section and once again as the full RESOLVED text. We
    concatenate every body window for a given resolution id so the dollar
    regex can pick up amounts that only appear in the long form.
    """
    bodies: dict[str, list[str]] = {}
    titles: dict[str, str] = {}
    for m in RESOLUTION_HEADER.finditer(text):
        res_id = m.group(1)
        # Take a generous window after the header — full resolution body
        body = text[m.start(): m.start() + 8000]
        # Truncate at the next resolution header (so we don't bleed in)
        next_match = RESOLUTION_HEADER.search(body, m.end() - m.start())
        if next_match:
            body = body[: next_match.start()]
        bodies.setdefault(res_id, []).append(body)

        # Extract the title: text after the header marker, up to (but not
        # including) the first WHEREAS/RESOLVED/blank-line, normalized.
        after_header = re.sub(
            r"^(?:Item\s+)?#?\s*\d{4}-\d{2}\s*[:\.]?\s*", "", body, flags=re.I
        )
        title_chunk = re.split(
            r"\n\s*\n|\bWHEREAS\b|\bRESOLVED\b|\bThe Commission|\bTh\s*e\s+Board\b|\bThe\s+Board\s+acted\b|\bTo\s+help\s+ensure\b",
            after_header,
            maxsplit=1,
            flags=re.I,
        )[0]
        title_chunk = re.sub(r"\s+", " ", title_chunk).strip().rstrip(".")
        # Fix spaced contract IDs that pdf extraction inserts (e.g. "GDC23 -002")
        title_chunk = re.sub(r"\bGDC\s*(\d{2})\s*-\s*(\d{3,4})", r"GDC\1-\2", title_chunk)
        title_chunk = re.sub(r"\bGDC\s*-\s*(\d{2})\s*-\s*(\d{3,4})", r"GDC-\1-\2", title_chunk)
        if len(title_chunk) > 250:
            title_chunk = title_chunk[:247].rstrip() + "…"
        if len(title_chunk) > len(titles.get(res_id, "")):
            titles[res_id] = title_chunk

    matches: dict[str, str] = {k: "\n".join(v) for k, v in bodies.items()}

    records = []
    for res_id, body in matches.items():
        title = titles[res_id]

        # Dollar: take the largest amount in the body that's >= $100k.
        # Smaller numbers are usually footnote percentages or page numbers
        # that snuck through the regex.
        amount = None
        for num_str, unit in DOLLAR.findall(body):
            try:
                v = parse_dollar(num_str, unit or None)
            except ValueError:
                continue
            if v < 100_000:
                continue
            if amount is None or v > amount:
                amount = v

        cid_match = CONTRACT_ID.search(body)
        contract_id = cid_match.group(0) if cid_match else None

        # Title cleanup: strip optional "Item " prefix and any leftover
        # "#YYMM-NN:" header that survived because the resolution body opened
        # with "Item #0724-01: ..." rather than "#0724-01: ...".
        clean_title = title
        for _ in range(3):
            stripped = re.sub(r"^(Item\s+)?#?\s*\d{4}-\d{2}\s*[:\.]?\s*", "", clean_title, flags=re.I).strip()
            if stripped == clean_title:
                break
            clean_title = stripped
        clean_title = re.sub(r"^Item\s+", "", clean_title, flags=re.I).strip()

        category = RESOLUTION_OVERRIDES.get((meeting_date, res_id))
        if category is None:
            category = categorize(clean_title, contract_id)

        records.append({
            "meetingDate": meeting_date,
            "minutesPdf": url,
            "resolutionId": res_id,
            "title": clean_title,
            "contractId": contract_id,
            "amountUsd": amount,
            "category": category,
            "isDuplicate": is_duplicate(clean_title),
        })

    # Sort by resolution id within a meeting
    records.sort(key=lambda r: r["resolutionId"])
    return records


def main() -> int:
    all_records: list[dict] = []
    for meeting_date, url in MEETINGS:
        print(f"{meeting_date}  {url.rsplit('/', 1)[-1]}")
        try:
            pdf = download(url)
            text = extract_text(pdf)
        except Exception as e:
            print(f"  ERROR: {e}")
            continue
        records = extract_resolutions(meeting_date, url, text)
        if not records:
            print(f"  (no resolutions extracted — PDF may be image-only)")
            continue
        for r in records:
            amt = f"${r['amountUsd']:>14,}" if r["amountUsd"] else "       (no $)"
            print(f"  #{r['resolutionId']}  {amt}  [{r['category']:<22}]  {r['title'][:80]}")
        all_records.extend(records)

    # Sort newest meeting first, then by resolution id within meeting
    all_records.sort(key=lambda r: (r["meetingDate"], r["resolutionId"]), reverse=True)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(all_records, indent=2) + "\n")

    total_with_amount = sum(1 for r in all_records if r["amountUsd"])
    by_cat: dict[str, int] = {}
    for r in all_records:
        if r["amountUsd"] and not r["isDuplicate"]:
            by_cat[r["category"]] = by_cat.get(r["category"], 0) + r["amountUsd"]
    print()
    print(f"Wrote {len(all_records)} resolutions to {OUTPUT.relative_to(ROOT)}")
    print(f"  {total_with_amount} have a dollar amount")
    print(f"  Cumulative authorized $ by category (excl. duplicates):")
    for cat, total in sorted(by_cat.items(), key=lambda kv: -kv[1]):
        print(f"    {cat:<22} ${total:>16,}")
    construction_only = by_cat.get("construction", 0) + by_cat.get("delivery-partner", 0)
    print(f"  Construction + delivery-partner: ${construction_only:,}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
