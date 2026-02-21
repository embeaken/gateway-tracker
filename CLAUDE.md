# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Type-check (`vue-tsc --build`) + Vite build in parallel
- `npm run type-check` — TypeScript validation only
- `npm run lint` — ESLint with auto-fix

## Architecture

Vue 3 single-page app tracking the Gateway Hudson River tunnel infrastructure project. No router, no state management library — just component-local refs and hardcoded data.

**Layout:** `App.vue` uses `MainLayout` (two-column grid with `#content` and `#sidebar` slots). Content slot holds `FundingTracker` + `ProjectCard` list. Sidebar holds `ActivityTimeline`. A `ContextCard` modal (teleported to body) provides background info.

**Data:** All data is hardcoded — no API calls. Projects come from `src/assets/data.ts`, timeline items from `src/assets/activityData.ts`. Types are in `src/types.ts`. Some components (AlertNotice, FundingTracker) have inline hardcoded content.

## Design System

All styling uses CSS custom properties defined in `src/assets/main.css`. No Tailwind, no component library.

**Dark mode requires dual selectors** — both must be present for any dark override:
```css
[data-theme="dark"] .element { ... }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .element { ... }
}
```

**Card pattern:** `background: var(--color-background)`, `border: 1px solid var(--color-border)`, `border-radius: var(--radius-md)`, `padding: var(--spacing-xl)`, `margin-bottom: var(--spacing-lg)`.

**Breakpoints:** 768px (mobile), 1024px (sidebar collapse).

## Conventions

- `<script setup lang="ts">` with Composition API everywhere
- Scoped styles in every component
- Flat component structure in `src/components/` (no subdirectories)

## Data Update Script

`scripts/update_data.py` fully regenerates `src/assets/activityData.ts` by fetching fresh data from four sources. Run via:

```sh
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY uv run scripts/update_data.py
```

[`uv`](https://docs.astral.sh/uv/) manages deps automatically via inline script metadata — no virtualenv setup needed. Without `ANTHROPIC_API_KEY`, PDF title/date extraction is skipped and filenames are used as fallbacks.

**Sources:**
- **Bluesky** — public AT Protocol API, `@gatewayprogram.bsky.social`, top 10 posts (no reposts/replies)
- **Photos** — scraped from `gatewayprogram.org/photo-gallery.html` (WordPress block gallery), top 10
- **Press releases** — PDFs from `gatewayprogram.org/wp-content/uploads/YYYY/MM/` matching `Press-Release` or `Statement`
- **Construction notices** — same source, matching `Construction-Notice`

**PDF enrichment:** Downloads each PDF, extracts text via `pypdf`, asks Claude Haiku for `{title, date}`. Title-cases results regardless of source capitalization. Falls back to filename-derived title/date if API unavailable or extraction fails.

**Date inference from filenames:** Three regex patterns (`YYYYMMDD`, `Month_DD_YYYY`, `M-DD-YYYY`); falls back to `YYYY-MM-01` from URL path. Fallback items are reported at end as "Dates needing review".

**After running:** Review printed output for dates needing manual correction in `activityData.ts`, and any unclassified PDFs (board meetings, agendas, public comments are silently filtered out).
