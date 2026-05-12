# Obsidian Plugin Review Guidelines

Rules to follow before submitting to obsidian-releases so the review bot passes.
Source: https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines

## Promise handling

- All unawaited async calls must be prefixed with `void`:
  ```ts
  void this.render();      // ✓
  this.render();           // ✗ — unhandled promise
  ```
- Callbacks that return promises must either `await` or `void` them explicitly.

## Event registration

- Always use `this.registerEvent(...)` to register vault/workspace events so they are automatically cleaned up on plugin unload:
  ```ts
  this.registerEvent(this.app.vault.on("modify", ...));   // ✓
  this.app.vault.on("modify", ...);                       // ✗ — leaks listener
  ```

## Intervals and timeouts

- Store interval IDs and clear them in `onClose()` / `onunload()`:
  ```ts
  this.nowLineInterval = window.setInterval(...);
  // in onClose:
  if (this.nowLineInterval !== null) window.clearInterval(this.nowLineInterval);
  ```

## Sentence case for UI strings

Command names, ribbon tooltips, settings labels, and modal headings must use sentence case (not Title Case):
```ts
name: "Open timeline"     // ✓
name: "Open Timeline"     // ✗
```

## Hardcoded colors

Prefer Obsidian CSS variables over hardcoded hex values where a semantic match exists:
```css
color: var(--text-muted);               /* ✓ */
color: #888888;                         /* ✗ */
background: var(--background-primary);  /* ✓ */
```
Exceptions: accent colors with no CSS variable equivalent (e.g., the now-line red) are acceptable.

## TypeScript types

- No `any` types — use specific types or generics.
- All public class members must have explicit types.
- Avoid non-null assertions (`!`) except where the API guarantees non-null.

## DOM usage

- Use Obsidian's DOM helpers (`createEl`, `createDiv`, `setText`, `addClass`) instead of raw DOM APIs:
  ```ts
  el.createEl("span", { text: "foo" });    // ✓
  document.createElement("span");          // ✗
  ```
- Do not use `innerHTML`.

## Layout readiness

- Defer work that depends on the vault or workspace until the layout is ready:
  ```ts
  this.app.workspace.onLayoutReady(() => void this.render());
  ```
  Avoids empty state when views are restored at startup before the vault is indexed.

## CSS scoping

- All CSS class names must be prefixed with the plugin ID (e.g., `tm-`) to avoid collisions with other plugins.
- CSS variables must use double dashes: `--my-var`.

## manifest.json

- `minAppVersion` must be a real released version of Obsidian.
- `isDesktopOnly: false` only if the plugin genuinely works on mobile.
- `description` must end with a period and be a complete sentence.

## No hardcoded paths

- Use `normalizePath()` for all file paths.
- Respect the user-configured folder in settings; do not hardcode `"Daily Notes"` (except as the default).
