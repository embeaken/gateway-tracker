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
