#!/usr/bin/env -S uv run
# /// script
# requires-python = ">=3.11"
# dependencies = ["truststore>=0.10"]
# ///
"""update_funding.py — Federal grant payments for the Hudson Tunnel Project from USAspending.gov

Usage:
    uv run scripts/update_funding.py [--summary-file PATH]

Writes src/assets/fundingData.json. With --summary-file, appends a Markdown
section to that file (the update-data workflow uses it as the PR body).

Accuracy rules:
  * Paid totals come straight from each award's USAspending record; obligated
    totals from the agencies' account (File C) data.
  * Monthly figures are derived from File C account data, which reports
    fiscal-year-to-date outlays: each month is the change since the last
    reported month in the same fiscal year (fiscal years start in October).
  * If the monthly figures don't add up to the award's total outlays, the file
    is NOT written and the run reports the mismatch.
"""

import argparse
import json
import sys
from datetime import date
from pathlib import Path
from urllib.request import Request, urlopen

import truststore

# Use the OS trust store, so the script also works behind TLS-inspecting proxies
truststore.inject_into_ssl()

USER_AGENT = "hudson.tube"
API = "https://api.usaspending.gov/api/v2"
OUT_FILE = Path(__file__).resolve().parent.parent / "src" / "assets" / "fundingData.json"

# `committed` is the maximum amount in the signed agreement, which USAspending
# doesn't carry (its "award amount" is only what has been obligated so far).
AWARDS = [
    {
        "key": "cig",
        "id": "ASST_NON_NY-2024-015_069",
        "name": "Capital Investment Grant",
        "agency": "Federal Transit Administration",
        "recipient": "GDC",
        # Full Funding Grant Agreement NY-2024-015, Jul 8 2024
        "committed": 6_880_000_000,
    },
    {
        "key": "fsp",
        "id": "ASST_NON_69A36524420700FSPNY_069",
        "name": "Federal-State Partnership grant",
        "agency": "Federal Railroad Administration",
        "recipient": "GDC",
        # Grant agreement 69A36524420700FSPNY, Sep 2024
        "committed": 3_799_999_820,
    },
    {
        "key": "raise",
        "id": "ASST_NON_NY-2024-014_069",
        "name": "RAISE grant (Tonnelle Ave bridge)",
        "agency": "Federal Transit Administration",
        "recipient": "GDC",
        "committed": 25_000_000,
    },
    {
        "key": "mega",
        "id": "ASST_NON_69A36524400010MEGDC_069",
        "name": "Mega grant (Hudson Yards concrete casing)",
        "agency": "Federal Railroad Administration",
        "recipient": "Amtrak",
        "committed": 292_171_053,
    },
]


def api(path, body=None):
    req = Request(
        f"{API}{path}",
        data=json.dumps(body).encode() if body is not None else None,
        headers={"User-Agent": USER_AGENT, "Content-Type": "application/json"},
    )
    with urlopen(req, timeout=30) as resp:
        return json.load(resp)


def funding_rows(award_id):
    rows, page = [], 1
    while True:
        d = api("/awards/funding/", {
            "award_id": award_id, "limit": 100, "page": page,
            "sort": "reporting_fiscal_date", "order": "asc",
        })
        rows += d["results"]
        if not d["page_metadata"].get("hasNext"):
            return rows
        page += 1


def calendar_month(fiscal_year, fiscal_month):
    """Fiscal period → (year, month). Fiscal month 1 is October of the prior year."""
    month = (fiscal_month + 8) % 12 + 1
    return (fiscal_year - 1 if fiscal_month <= 3 else fiscal_year), month


def monthly_outlays(rows):
    """[{from, to, amount}] — outlays per reporting period, in dollars.

    `from`..`to` spans more than one month when a period covers several
    (e.g. the first quarterly report, or months skipped in the data).
    """
    # Sum fiscal-year-to-date outlays across Treasury accounts for each period
    fytd = {}
    for r in rows:
        if r["gross_outlay_amount"] is not None:
            key = (r["reporting_fiscal_year"], r["reporting_fiscal_month"])
            fytd[key] = fytd.get(key, 0) + r["gross_outlay_amount"]

    out, prev = [], {}
    for (fy, fm), total in sorted(fytd.items()):
        prev_fm, prev_total = prev.get(fy, (0, 0.0))
        start = calendar_month(fy, prev_fm + 1)
        end = calendar_month(fy, fm)
        out.append({
            "from": f"{start[0]:04d}-{start[1]:02d}",
            "to": f"{end[0]:04d}-{end[1]:02d}",
            "amount": round(total - prev_total, 2),
        })
        prev[fy] = (fm, total)
    return out


def fetch_award(spec):
    detail = api(f"/awards/{spec['id']}/")
    rows = funding_rows(spec["id"])
    monthly = monthly_outlays(rows)
    # Obligations from the agencies' account data. The award-level "total
    # obligation" can overstate it: for the FSP grant it shows the full $3.8B
    # agreement although only $2.85B has been obligated.
    obligated = round(sum(r["transaction_obligated_amount"] or 0 for r in rows), 2)
    paid = round(detail["total_outlay"] or 0, 2)
    summed = round(sum(m["amount"] for m in monthly), 2)
    if abs(summed - paid) > 1:
        raise ValueError(
            f"{spec['name']}: monthly outlays sum to ${summed:,.2f} "
            f"but USAspending reports ${paid:,.2f} paid"
        )
    return {
        "key": spec["key"],
        "name": spec["name"],
        "agency": spec["agency"],
        "recipient": spec["recipient"],
        "usaspendingUrl": f"https://www.usaspending.gov/award/{spec['id']}",
        "committed": spec["committed"],
        "obligated": obligated,
        "paid": paid,
        "lastModified": (detail.get("period_of_performance") or {}).get("last_modified_date"),
        "monthly": monthly,
    }


def money(n):
    return f"${n / 1e6:,.1f}M"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--summary-file", type=Path, help="Append a Markdown summary to this file")
    args = parser.parse_args()

    old = json.loads(OUT_FILE.read_text()) if OUT_FILE.exists() else {"awards": []}
    old_by_key = {a["key"]: a for a in old["awards"]}

    lines = ["", "## Federal funding (USAspending)", ""]
    try:
        awards = [fetch_award(spec) for spec in AWARDS]
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        lines.append(f"**Not updated:** {e}. `fundingData.json` was left as it was.")
        if args.summary_file:
            with args.summary_file.open("a") as f:
                f.write("\n".join(lines) + "\n")
        sys.exit(1)

    through = max(m["to"] for a in awards for m in a["monthly"])
    data = {"source": "USAspending.gov", "through": through, "awards": awards}

    if old == data:
        lines.append("No changes.")
    else:
        OUT_FILE.write_text(json.dumps(data, indent=2) + "\n")
        lines.append(f"Data through {through}.")
        lines.append("")
        for a in awards:
            before = old_by_key.get(a["key"], {})
            delta = a["paid"] - before.get("paid", 0)
            note = f" (+{money(delta)})" if before and delta else ""
            lines.append(f"- {a['name']}: {money(a['paid'])} paid of {money(a['obligated'])} obligated{note}")

    report = "\n".join(lines)
    print(report)
    if args.summary_file:
        with args.summary_file.open("a") as f:
            f.write(report + "\n")


if __name__ == "__main__":
    main()
