# Hudson Tunnel Project: data catalog

Research snapshot, 10 Oct 2026. Every figure has a source. `U/` is short for
`https://www.gatewayprogram.org/wp-content/uploads/`.

`gdc-uploads-index.txt` lists all 632 non-image files in `U/` (crawled 10 Oct 2026).

---

## 1. Live and refreshable feeds

| Feed | What it gives | Cadence / lag | Access |
|---|---|---|---|
| **EarthCam public API** | Latest still per camera view, daily panoramas, timelapse assets, timestamps. Append `?Size:thumbnail` (180w, ~5KB), `Tiny` (360w, ~16KB), `medium` (1440w, ~200KB), `Half` (1920w, ~350KB), or `Full` (4K, ~1MB) to any image URL. Image URLs are unique to each frame, so they can be cached indefinitely. | Stills every 15 min | `GET https://share.earthcam.net/api/v2/public/page/{token}/{name}` returns JSON with `access-control-allow-origin: *`, so the browser can call it directly. 10 still views across our 6 camera pages (Palisades Portal has 2 cameras, Tonnelle and HC Shaft have 2 views each). |
| **USAspending API** | Monthly federal outlays per grant | Monthly, ~1–2 months behind | `POST https://api.usaspending.gov/api/v2/awards/funding/` with `award_id`. Award IDs below. |
| **GDC uploads dir** | Board decks, minutes, press releases, construction notices, monthly look-aheads, quarterly Gazette | Several files a month | Apache directory listing at `U/YYYY/MM/`. `update_data.py` already crawls it. |
| **FTA PMOC quarterly reports** | % complete by time and by cost for each package, schedule contingency, safety | Quarterly, published ~4 months late | `transit.dot.gov/foia/hudson-tunnel-project`. Akamai blocks curl, so these have to be downloaded by hand. Dollar tables are redacted (b)(4), but the percentages are not. |
| **GDC External Engineering Consultant annual report** | Cumulative cost of work in place for packages over $500M | Yearly, April | `U/2026/04/Annual_Report_Package_1B_vF.pdf` (only P1B so far; P1C and P3 should appear next year). |
| **Board minutes and resolutions** | Contract prices, Market Case Estimates, change orders | About monthly | `U/YYYY/MM/*Minutes*`. 2023–Apr 2026 text is already in `scripts/data/board-minutes/`. |

### USAspending award IDs

| Award | `generated_internal_id` | Obligated | Outlays to date |
|---|---|---|---|
| FTA CIG (FFGA NY-2024-015) | `ASST_NON_NY-2024-015_069` | $2.2B of $6.88B | $277.5M (Aug 2026) |
| FTA RAISE (Tonnelle, NY-2024-014) | `ASST_NON_NY-2024-014_069` | $25M | $19.5M |
| FRA Mega grant, HYCC-3 (to Amtrak) | `ASST_NON_69A36524400010MEGDC_069` | $292.2M | $222.0M |
| FRA FSP grant (69A36524420700FSPNY) | `ASST_NON_69A36524420700FSPNY_069` | $2.85B of $3.8B | $588.9M (Aug 2026) |
| RRIF loans (NY / NJT / PANYNJ) | `ASST_NON_69A6212470050RRIFNY202400050_069` etc. | $1.487B / $703M / $1.87B face value | **draws not reported** |

The FSP award doesn't appear in keyword or recipient search, but `/api/v2/awards/<id>/` and `/awards/funding/` return it. Grant payouts through Aug 2026 total $885.9M (CIG + FSP + RAISE). They reconcile with GDC's numbers: FY25 totals match the COFC complaint, and Feb 2026 CIG + FSP + RAISE + withheld RRIF = $235.75M, the exact sum of the Feb 13/17/18 payments.

---

## 2. Spending: what exists

There is **no CHSRA-style monthly spend report**. The best options, from most to least useful:

1. **USAspending grant outlays (monthly, can be automated).** This covers CIG, FSP and RAISE. Only the RRIF loan draws are missing, and those are the local share.
   File C reports year-to-date totals, so subtract the previous month to get each month's figure. Each fiscal year starts in October.
   FSP by month ($M): 2025-01 0.9 · 02 6.3 · 04 1.9 · 05 7.3 · 06 40.4 · 07 104.6 · 08 20.8 · freeze · 2026-02 136.7 · 03 57.3 · 04 43.0 · 05 50.4 · 06 103.8 · 07 15.5. The CIG table follows:

   | Month | CIG $M | | Month | CIG $M |
   |---|---|---|---|---|
   | 2024-12 | 17.5 | | 2025-08 | 5.0 |
   | 2025-01 | 22.6 | | 2025-09 | 7.5 |
   | 2025-02 | 26.9 | | 2025-10 → 2026-01 | **0 (funding freeze)** |
   | 2025-03 | 34.5 | | 2026-02 | 66.5 (catch-up) |
   | 2025-04 | 3.4 | | 2026-03 | 11.8 |
   | 2025-05 | 1.1 | | 2026-04 | 12.4 |
   | 2025-06 | 5.2 | | 2026-05 | 16.5 |
   | 2025-07 | 6.4 | | 2026-06 | 17.8 |
   | | | | 2026-07 | 13.6 |
   | | | | 2026-08 | 8.7 |

   The cumulative $130.2M through Sep 2025 matches the COFC complaint's figure exactly, which suggests the series is reliable.

2. **GDC's monthly reimbursement requests, Aug 2025 to Jan 2026**, from GDC v. US complaint, COFC, 2 Feb 2026 (`U/2026/02/20260202-GDC-COFC-Complaint.pdf`):

   | Request | Total | CIG | FSP | RAISE | RRIF |
   |---|---|---|---|---|---|
   | Aug 2025 | $29.08M | $5.20M | | | |
   | Sep 2025 | $38.95M | $18.91M | $8.87M | $0.66M | $10.51M |
   | Oct 2025 | $49.92M | $17.85M | $26.40M | $0.22M | $5.45M |
   | Nov 2025 | $71.84M | $12.19M | $51.75M | $0.85M | $7.05M |
   | Dec 2025 | $39.36M | $12.39M | $19.23M | $0.55M | $7.20M |
   | Jan 2026 | $49.78M | $11.84M | $30.48M | $0.47M | $6.56M |

   Rough burn rate: **~$30–70M/month** in federal reimbursements during late 2025.

3. **Point-in-time totals**
   - "More than $1 billion" spent, Jan 2026 board deck (`U/2026/01/January-2026-Board-Meeting-Deck-for-website.pdf` p8)
   - "Approximately $1.8 billion" expended, about 150 contractors and subcontractors, 2 Feb 2026 (COFC complaint ¶129)
   - Federal reimbursements through Sep 2025: **$393.87M**. That's CIG $130.19M, FSP $182.1M, RAISE $14.24M, and RRIF $67.35M (PANYNJ $43.9M, NY $19.3M, NJ $4.2M).
   - Reimbursements after the freeze, March 2026 deck p4: Feb 13 $30.2M, Feb 17 $77.7M, Feb 18 $127.9M, Mar 2 $6.6M, Mar 4 $12.3M. **Total $254.6M**.
   - Suspension cost if work stopped: **$15–20M/month**. Financing costs: $17M in FY25, forecast $30M in FY26 (complaint ¶181).

4. **Progress by cost for each package** (PMOC, June 2025):
   - HRGS: 46% of time elapsed, 46% of budget spent
   - Palisades: 26% of time, 17% of budget
   - P1B Manhattan: 10% of time, 10% of budget
   - Tonnelle (Dec 2024): 61% of time, 58% of budget, $17.95M invoiced
   - P1B at end of 2025: **$279.95M of $1,177.7M (23.8%)** work in place (EEC report)

---

## 3. Program facts

- **Cost:** $16.041B including $1.421B finance charges (PMOC). FFGA total project cost: $14,576.2M (FTA FY25 profile).
- **Funding:** CIG $6.88B · FSP $3.8B · RAISE $25M · Mega (HYCC-3) $292M · Amtrak $1.016B · RRIF local share $4.006B (NY $1.487B, NJ TRANSIT $703M, PANYNJ $1.87B). Plus a $975M standby loan and a $500M Bank of America liquidity line.
- **Federal share:** about 70% (Jan 2026 deck). The complaint says "~$15B federal, ~90%" because it counts the RRIF loans.
- **Obligated:** $4.38B as of Jan 2026 (CIG $1.5B, FSP $2.85B, RAISE $25M). CIG rose to $2.2B with another $700M in Aug 2026, per USAspending, which puts the total at about $5.08B.
- **Schedule:** FFGA completion Nov 2040. Planned in-service date 2038 (complaint ¶181). Program schedule contingency fell from 18.2 to 14.7 months at the Jun 2025 rebaseline, then P1B slipped about 4 more months (EEC report).
- **Jobs:** 95,000 jobs and $19.6B in economic activity overall. 20,000+ jobs supported by active packages. About 1,000 workers on site (Jan 2026).
- **Corridor:** 2,200 NEC train movements and 800,000 trips a day. 450 trains a day and 200,000+ passenger trips through the North River Tunnel (opened 1910, damaged by Sandy in 2012).
- **Freeze timeline:** 30 Sep 2025 FTA pause → 1 Oct shutdown → 6 Feb 2026 construction pause → 13–18 Feb reimbursements → work resumed the week of 23 Feb 2026 (Jan and Mar 2026 decks; Feb 2026 statements).

## 4. The ten packages

| # | Package | Contractor | Contract | Market Case Est. | Status (Oct 2026) |
|---|---|---|---|---|---|
| P4 | Tonnelle Ave Bridge & Utility Relocation | Conti Civil | $28.6M | $47.3M (Sep 2023) | **Complete** (2025). 400 jobs. |
| P1A | Palisades Tunnel (+ HC Access Shaft) | Schiavone Lane Dragados JV, PANYNJ-delivered | n/f | $744.8M (Aug 2024) | TBM 1 mining 8 Oct 2026; TBM 2 in Nov. HC shaft excavation in progress. 5,500 jobs. |
| EA-1 | Hudson River Ground Stabilization | Weeks Marine | $284M → **$372M** (+$88M CO, Jul 2026) | $337.5M → **$443.2M** | ~1,000 ft × 100 ft stabilized. Pier 68 pile removal starts late 2026, ends 2028. 2,300 jobs. |
| P1B | Manhattan Tunnel (+ 12th Ave Shaft) | Frontier-Kemper/Tutor Perini JV | $1,177.7M | $1,835.0M (Feb 2025) | NTP 24 Feb 2025, completion 26 Apr 2030. Slurry wall and cap beam done. 400+ of 1,127 freeze pipes. 7,200 jobs. |
| HYCC-3 | Hudson Yards Concrete Casing §3 | Amtrak / NY Concrete | n/f | $692.7M (May 2023) | Walls mostly done, roof about half done. Substantial completion end of 2026. 4,800 jobs. |
| P1C | Hudson River Tunnel Section | Traylor/Walsh/Skanska JV | $1,282.9M | $2,079.9M (Apr 2026) | Awarded 27 Apr 2026. Test pits, Willow Ave prep. |
| P3 | NJ Surface Alignment | Skanska Creamer Sanzari NJSA JV | $711.7M | $1,424.3M (Jun 2026) | Awarded 1 Jun 2026. Mobilized at Tonnelle west staging. |
| P2A | A-Yard & 10th Ave Tunnel | n/a | n/a | n/a | Shortlist 10 Jul 2026. Labor agreement authorized Sep 2026. |
| n/a | Tunnel Systems & Fit-Out | n/a | n/a | n/a | In procurement |
| n/a | North River Tunnel Rehabilitation | n/a | n/a | n/a | After the new tunnel opens |

**Committed so far:** the Market Case Estimates add up to about **$7.27B of $16.04B (45%)**.
Seven of the ten packages are under contract or complete. (n/f = not found yet.)

Sources: board minutes (`9-11-23`, `5-2-23`, `2024.02.16`, `2024.08.01`, `2025.02.03`, `4-27-26`, `6-1-26`, `7-8-26`),
the April, June, and July 2026 decks, the Jan 2026 deck (jobs), the Summer and Fall 2026 Gazettes, and the PMOC June 2025 report.

### Package detail worth surfacing

- **TBMs (P1A):** 28 ft 8 in cutterhead, ~500 ft trailing gantry, >1,680 tons, ~$25M each, 1,000+ sensors and refuge chambers. ~30 ft/day including maintenance. About 1 year to the HC shaft.
- **HRGS:** plan of 900 primary and 792 secondary soil-mix columns (PMOC). Done: 838 total columns (Jan 2026) → 684 primary + 600 secondary (summer 2026). Area stabilized: 60k sq ft (Jan) → 90k+ (Jul) → ~1,000 × 100 ft (Fall Gazette). About 500 Pier 68 piles to remove.
- **P1B:** 1,127 freeze pipes (47 by Dec 2025, 400+ by Fall 2026), 40 geotechnical borings, 63 contractor change letters consolidated into 37 unique changes (EEC report).
- **HYCC-3:** 337 secant piles, 40,600 tons excavated (May 2025). 7,200 cy poured (Oct 2025–Jan 2026). 5,500 cy roof poured in two 18-hour pours (Jul 2026).
- **P1C:** two tubes of 7,250 ft, two mixed-ground TBMs, 9 cross passages.
- **P3:** 1.5 mi, 4,170 ft of embankment, 3,150 ft of viaduct (19′9″–28′9″ high), 70 ft Secaucus Rd bridge, 150 ft Conrail/NYSW bridge, 300,000 sq ft cleared.

## 5. EIS facts (FEIS, May 2021, Ch. 2–3; PDFs at hudsontunnelproject.com/FEIS)

- New alignment ~4.5 mi (Secaucus to Manhattan); tunnel ~2.8 mi portal to portal
- Tunnel ID ~25 ft, OD ~28 ft. Tubes 20–25 ft apart.
- Excavation ~1.3M loose cy in total:
  - Palisades tubes and cross passages: 500k cy
  - River tubes: 580k cy
  - Hoboken (HC) shaft: 90k cy, ~75 ft deep
- EIS boring rates:
  - Palisades: 30 ft/day (≈8 months a tube)
  - River: 35 ft/day (≈9 months a tube)
- 6 Palisades cross passages, about every 750 ft, drill-and-blast
- Trucking at peak:
  - Tonnelle: 15–26 trucks/hr
  - Manhattan: 8–14 trucks/hr
  - NRT rehab: up to 17/hr each way
- Derived live metric: `ft bored × π·(14.33 ft)² ÷ 27 ≈ 24 bank cy/ft per tube`. That gives a live "rock removed" estimate alongside the TBM footage.

## 6. Leads not yet pulled

- Remaining PMOC reports: Dec 2024 and Jun 2025 are known. Later quarters should appear on the FTA FOIA page.
- Amtrak OIG, OIG-A-2026-001 (Dec 2025): Amtrak's $1.016B share, risk findings.
- **EarthCam archive works:** `GET …/{page}/{camera_short}/archive/{day|hourly|daily}/{YYYY-MM-DD}?ref={view.ref}&direction=1`.
  - `day` returns 10-min frames for a single day.
  - `hourly` returns one frame per hour.
  - `daily` returns one noon frame a day for the whole month.
  - Coverage goes back to each camera's start (e.g. HC shaft from Sep 2025). This enables our own timelapse and "one year ago" comparisons.
- Board decks from Jul 2026 on have "2024 vs 2026" photo pairs for each site, which could feed a before/after slider.
- Monthly "Look Ahead" PDFs (e.g. `U/2026/08/Hudson-Tunnel-Project-September-Look-Ahead-2026-v5.pdf`) could feed a "this month on site" panel.
- NEPA re-evaluations #1–#8+ (hudsontunnelproject.com/Library) could feed a scope-change log.

## 7. Gaps in `update_data.py` (found 10 Oct 2026)

These notices since June 2026 never reached `activityData.json`. Their filenames don't match `CONSTRUCTION_NOTICE_PATTERNS`:
- `CN-*`, e.g. `CN-18-Hour-Concrete-Pour`, `CN-Overnight-Shaft-Excavation-Work`, `CN-P1C-October-2026`
- `TBM-Mining-Starting_Eng.-Spa._FV`
- `Hudson-County-Shaft-Upcoming-Excavation-Work`
- `Willow-Ave-Site-Mobilization`
- `P1A_Road-Sidewalk-Maintenance-Notice`
- `NJ-Surface-Alignment-Update`
- `*-Look-Ahead-*`

Source types that are ignored entirely but could feed the activity feed:
- **Board meetings:** the deck, plus `Resolutions-for-Website-*` with action-item titles such as contract awards and change orders
- **Procurement milestones:** e.g. `P2A-Shortlist`, the DBE goal public meeting
- **Explainers:** `TBM-Operation`, `Construction-Packages`, `HTP-Overview-Bifold`
- **Annual reports:** GDC annual report, consultant (EEC) report

## 8. Timeline sources (facts and GDC-stated dates only)

| Date | Event | Source |
|---|---|---|
| May 2021 | Record of Decision | `U/2025/10/2021-05-28-Hudson-Tunnel-Project-ROD.pdf` |
| Nov 2023 | Construction begins (Tonnelle) | NJ/NY CEC FAQ, Aug 2026 |
| Jul 8 2024 | FFGA and RRIF loans signed | FFGA press release |
| Oct 2025 | Tonnelle Ave bridge substantially complete | COFC complaint |
| Feb 6 → ~Feb 23 2026 | Construction paused, then resumed | Feb 2026 statements, Mar 2026 deck |
| Apr 27 / Jun 1 2026 | P1C and P3 awarded: all boring and heavy civil work under contract | Board minutes, P1C release |
| Oct 8 2026 | TBM 1 starts mining | Press release |
| "Coming weeks" | TBM 2 launch | Oct 8 release |
| 2026 | HYCC-3 finished ("on track to be finished in 2026") | COFC complaint |
| ~1 yr after launch | TBMs reach HC shaft | Sep 28 release |
| 2028 | HRGS change-order work complete | Jul 2026 deck |
| Apr 26 2030 | P1B completion | EEC report |
| 2035 / 2038 | New tunnel in service / NRT rehab done | FFGA release, CEC FAQ, HTP bifold |

## 9. Spending by package: what exists

| Package | Spent figure | As of | Source |
|---|---|---|---|
| P1B Manhattan | $279.95M of the $1,177.7M contract | Dec 2025 | EEC annual report (yearly, packages over $500M only, so P1C and P3 join next year) |
| HRGS / Palisades / P1B | 46% / 17% / 10% "complete in terms of expenditure" | Jun 2025 | PMOC Q2 2025, the latest public quarterly report |
| Tonnelle | $17.95M invoiced | Nov 2024 | PMOC Q4 2024 |
| Everything else | not published | n/a | n/a |
