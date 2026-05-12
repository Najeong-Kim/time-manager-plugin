# CLAUDE.md

## Git

- Never add a `Co-Authored-By` trailer to commit messages
- Commit format: concise one-line subject, optional body if needed

## Build & deploy

- Build: `npm run build`
- Local testing: after building, copy files to the vault plugin folder
  ```
  /Users/najeong/Library/Mobile Documents/iCloud~md~obsidian/Documents/.obsidian/plugins/time-manager/
  ```
  Files to copy: `dist/main.js`, `manifest.json`, `src/styles.css`
- After copying, reload the plugin in Obsidian by toggling it OFF → ON

## Obsidian plugin review (ObsidianReviewBot)

See `.claude/REVIEW_GUIDELINES.md` for the full list of rules.

- Prefix unhandled async calls with `void`
- Always register events via `this.registerEvent(...)`
- Use sentence case for all UI strings (e.g. `"Open timeline"` ✓, `"Open Timeline"` ✗)
- Prefer Obsidian CSS variables over hardcoded values (`var(--text-muted)`, etc.)
- Use Obsidian DOM helpers (`createEl`, `createDiv`, etc.) — never `innerHTML`

## Vault info

- Vault path: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents`
- Daily notes folder: `Daily Notes/`
- Filename format: `YYYY-MM-DD.md`
