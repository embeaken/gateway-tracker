Run the data update script to fetch fresh content from all sources (Bluesky, photo gallery, press releases, construction notices) and rewrite `src/assets/activityData.json`.

```sh
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY uv run scripts/update_data.py
```

Add `--force` to bypass the cache and re-enrich all entries from scratch.

After it runs, review the output:
- **Dates needing review** — correct any fallback dates manually in `activityData.json`
- **Unclassified files** — check if any new document types should be added to the script
