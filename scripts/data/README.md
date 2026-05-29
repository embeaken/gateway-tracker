# GDC board materials - extracted text corpus

Snapshot of text extracted from GDC board meeting PDFs (pypdf). Useful as
input for future widget ideas that mine board materials for stats.

Sources are listed at https://www.gatewayprogram.org/board-meetings-3.html

## `board-minutes/`

Text extracted from every Minutes/Resolutions PDF for board meetings from
May 2023 → April 2026 (25 files). These are text-rich: each contains the
full text of every resolution adopted at that meeting, including dollar
caps, contract IDs (`GDC-YY-NNN-XX` or older `GDCYY-NNN`), counterparties,
and procedural context.

## `board-decks/`

Text extracted from a sample of six "Overview Presentation" decks
(Feb 2024, Aug 2024, Feb 2025, May 2025, Sep 2025, Mar 2026). These decks
are mostly slide images with minimal extractable text — useful primarily
for tracking what *narrative themes* a meeting covered and for the
occasional text-rich slide.

**Notable text-rich decks:**

- `may2025.txt` — the only deck found with full per-project KPIs in
  extractable text. Slide formats: `Anticipated Completion: Qx YYYY |
  Jobs Created: N` for all five projects, plus "HYCC-3 Project 50%
  Complete" with detailed sub-stats (337 secant piles, 40,600 tons
  excavated, 4,820 jobs supported, $400M labor income). Strong candidate
  source for any future "project status snapshot" widget.
- `mar2026.txt` — detailed federal reimbursements table with exact
  dollar amounts received Feb-Mar 2026 ($254.6M total). Could anchor a
  "federal funds disbursed" widget if similar tables surface in future
  meetings.

These text files are not refreshed automatically. They are a one-time
snapshot to keep context available without re-downloading 28MB of PDFs.
