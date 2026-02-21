Run the data update script to fetch fresh content from all sources (Bluesky, photo gallery, press releases, construction notices) and rewrite `src/assets/activityData.ts`.

```sh
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY uv run scripts/update_data.py
```

After it runs, review the output:
- **Dates needing review** — correct any fallback dates manually in `activityData.ts`
- **Unclassified files** — check if any new document types should be added to the script
