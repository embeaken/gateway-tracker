Review the current session and flush any new, stable knowledge to the project's internal Claude files. Do not ask for confirmation — just do it.

## Files to update

1. **`CLAUDE.md`** (project root) — project instructions checked into the repo. Update if there are new conventions, architecture facts, script flags, or workflow notes that would help a future Claude session working on this project. Keep it concise; avoid session-specific details.

2. **`/home/ilya/.claude/projects/-home-ilya-dev-gateway-tracker/memory/MEMORY.md`** — persistent auto-memory across sessions. Update with stable patterns, key file paths, architectural decisions, and user preferences confirmed in this session. Do not duplicate what's already in CLAUDE.md.

3. **`.claude/commands/*.md`** — skill files. Update any skill whose documented behavior changed this session (e.g. new flags, changed commands). Create a new skill file only if a clearly repeatable workflow emerged.

## What to write

- New CLI flags or script options added
- Architectural decisions made or reversed
- Conventions confirmed or corrected
- Bugs found and their root causes (if likely to recur)
- User preferences expressed explicitly ("always X", "never Y", "I'd rather Z")

## What to skip

- In-progress or one-off work from this session
- Anything speculative or unverified
- Content already present in the files
- Session-specific context (what we were debugging today, etc.)

After updating, print a brief summary of what changed in each file (or "no changes" if nothing was new).
