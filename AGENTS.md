# AGENTS.md

This file provides guidance for agents working in this repository.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Type-check (`vue-tsc --build`) + Vite build in parallel
- `npm run type-check` — TypeScript validation only
- `npm run lint` — ESLint with auto-fix

## Architecture

Vue 3 single-page dashboard tracking the Gateway Hudson River tunnel project. No router, no state management library. Data is static JSON written by scripts, plus one live feed (cameras) served by Netlify Functions.

**Layout (`App.vue`):** `AppHeader` ("What is this?" opens the `OverviewExplainer` drawer), then a two-column grid inside `.container`:
- **Main column:** `RouteMap` (route side view with estimated TBM positions), two `TbmCard`s, `CameraWall`, `FundingCard` beside `PhotoGallery`, then `PackagesTable`.
- **Right rail:** `ProjectTimeline` and `ActivityTimeline` (the GDC feed, photos excluded because the gallery covers them). On wide screens the rail is sticky and the feed scrolls inside it.

Cards other than the route map and TBM cards use `DashCard` (small uppercase title, optional right-aligned meta). Camera tiles open `CameraModal` (EarthCam's interactive player). Photos open `PhotoLightbox`, which both the gallery and the feed use.

**Data:**
- `src/assets/data.ts`: hand-maintained facts (projects/cameras, route geometry, `tbms`, construction packages, funding split, milestones). Every figure comes from a GDC document; sources are in `docs/research/data-catalog.md`. TBM launch dates live only in `tbms`; the camera status text, explainer copy, map estimates and TBM cards all derive from it. Milestones are only facts and GDC-stated dates, and `done` is flipped by hand, never inferred from the date.
- `src/assets/activityData.json`: the GDC feed, written by `scripts/update_data.py`.
- `src/assets/fundingData.json`: federal grant payments, written by `scripts/update_funding.py`.

Types are in `src/types.ts`, `src/assets/activityDataTypes.ts` and `src/assets/fundingData.ts`. GDC photos are resized through Netlify Image CDN (`src/imageCdn.ts`).

**Camera backend (`netlify/functions/`, shared code in `src/earthcam.ts`):**
- `GET /api/cams` lists the latest still of every EarthCam view. It's CDN-cached for 5 minutes.
- `GET /api/cam-frame/:host/:id` proxies one still at EarthCam's `medium` size (1440px), cached forever; frame URLs are unique per still.
- The browser never calls EarthCam for stills, so EarthCam's load stays flat regardless of traffic. Tiles go through Netlify Image CDN (`cdnSiteImage`).
- In dev, `vite.config.ts` serves the functions from the Vite dev server (matching each function's `config.path`), so `npm run dev` works without `netlify dev`.

## Design System

All styling uses CSS custom properties defined in `src/assets/main.css`. No Tailwind, no component library.

**Dark mode requires dual selectors** — both must be present for any dark override:
```css
[data-theme="dark"] .element { ... }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .element { ... }
}
```

**Card pattern:** `background: var(--color-card-bg)`, `border: 1px solid var(--color-border)`, `border-radius: var(--radius-md)`, `padding: var(--spacing-xl)`. Use `--color-card-bg` (not `--color-background`) — the page background is warm off-white (`#F7F5F0`), cards stay white.

**Breakpoints:** 768px (mobile), 900px (TBM cards side by side), 1024px (route map switches to the vertical list), 1200px (rail moves beside the main column), 1700px (funding and photos side by side). The camera wall picks its column count with container queries.

**Numbers** on the dashboard use `--font-family-mono` (JetBrains Mono). Dashboard colors (`--color-line`, `--color-ok`, `--color-alert`, `--color-fund-*`, `--color-text-tertiary`) have dark-mode values in both dark blocks of `main.css`.

## Conventions

- `<script setup lang="ts">` with Composition API everywhere
- Scoped styles in every component
- Flat component structure in `src/components/` (no subdirectories)
- Every outbound HTTP request we control (scripts, any future backend) sends `User-Agent: hudson.tube`

## Data Update Script

`scripts/update_data.py` writes `src/assets/activityData.json` (and its PDF cache, `scripts/data/pdf-index.json`) by fetching fresh data from four sources. Run via:

```sh
HUDSON_TUBE_ANTHROPIC_API_KEY=... uv run scripts/update_data.py [--force] [--summary-file PATH]
```

`--force` ignores all caches and re-reads everything. `--summary-file` also writes the run summary as Markdown; the `update-data.yml` workflow uses it as the PR body, so read the PR description for anything needing review.

[`uv`](https://docs.astral.sh/uv/) manages deps automatically via inline script metadata, so no virtualenv setup is needed. Without the API key, PDF titles come from filenames, dates fall back to the upload folder (`YYYY-MM-01`), and PDFs that match no filename pattern are listed as unclassified instead of read.

**Sources:**
- **Bluesky:** public AT Protocol API, `@gatewayprogram.bsky.social` (no reposts/replies)
- **Photos:** scraped from `gatewayprogram.org/photo-gallery.html` (WordPress block gallery)
- **Videos:** scraped from `gatewayprogram.org/video-gallery.html` (YouTube embed iframes). Upload dates come from each video's `youtube.com/watch` page.
- **Press releases and construction notices:** PDFs from `gatewayprogram.org/wp-content/uploads/YYYY/MM/`. Up to 100 of each, newest first.

**PDF classification:** filename patterns (`PRESS_RELEASE_PATTERNS`, `CONSTRUCTION_NOTICE_PATTERNS`, `IGNORED_PDF_PATTERNS`) are only a fast path. Any other PDF is downloaded and the LLM decides whether it's a press release, a construction notice, or "other" (board materials, procurement, reports, forms). GDC's filenames are too inconsistent for patterns alone: `CN-…`, `TBM-Mining-Starting_…` and `…-Look-Ahead-…` all slipped through before. Whole upload folders are processed, then items are de-duplicated (same title and date), sorted by date, and trimmed, because GDC sometimes re-uploads years of old files into one month.

**Caching:**
- `scripts/data/pdf-index.json` records category, title, date and `classifiedBy` (`filename` or `llm`) for every PDF ever read, including "other" ones, so each file is downloaded and sent to the LLM once. To fix a misclassified file, edit its `category` there.
- `activityData.json` is the cache for photo and video dates.

**LLM (`LLM_MODEL`, currently Claude Sonnet 5.5):**
- PDF title, date, and category when the filename didn't decide it: one call per new PDF
- Dates from filenames for items whose PDF didn't state one, and for new photos: batched
- Videos don't use the LLM

**Data flow:** Python writes JSON → `activityData.ts` imports it and re-exports with types from `activityDataTypes.ts`. To add/change types, edit `activityDataTypes.ts` (static) and update the `activityData.ts` re-exports. Neither is generated.

## Funding Data Script

`scripts/update_funding.py` writes `src/assets/fundingData.json` from the USAspending.gov API: committed, obligated and paid amounts and monthly payments for the four federal grants (FTA CIG, FRA FSP, FTA RAISE, and the FRA Mega grant to Amtrak for Hudson Yards). `committed` (the signed-agreement maximum) is set in the script, because USAspending only has obligations. The update-data workflow runs it after `update_data.py` and appends its summary to the PR body.

Monthly figures are derived from fiscal-year-to-date account data, so a period can span several months (`from`/`to`). If the monthly figures don't add up to the award's reported total, the script refuses to write the file. Accuracy beats freshness here.
