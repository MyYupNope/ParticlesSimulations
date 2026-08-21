# Focus Stage — Site Redesign Plan (Option 1)

Canvas-first redesign: full-viewport particle sculpture with a floating glass control dock at the bottom (desktop) and a side drawer that auto-closes after selections (mobile).

## Decisions (from user)

1. **Desktop**: controls live in a bottom dock that takes available space. **Mobile (<768px)**: side drawer; auto-closes 1s after a selection unless another selection is made (timer resets).
2. **Message input**: always visible.
3. **Top bar**: ultra-minimal — wordmark + status pill.

## Layout

- `#topbar` (fixed top): wordmark "KINETIC", status pill (GPU / FPS), hamburger (mobile only)
- `#dock` (fixed bottom-center, desktop): message input + emoji strip, preset chips, theme swatches, font select, actions (capture/share/audio), collapse toggle
- `#drawer` (mobile): side drawer with presets, theme, font, actions — auto-closes 1s after selection
- `#input-bar` (mobile): always-visible compact message input at the bottom
- `#context-chip`: dynamic one-line experiment description
- `#hint`: first-visit overlay, fades on first interaction, remembered via localStorage
- `#stage`: full viewport on all breakpoints (no more 320px sidebar offset)

## Key changes

- HTML: remove old sidebar/menu elements; add topbar, dock, drawer, input bar
- CSS: glass tokens, dock styling, drawer slide, hint fade, toast variants (info/success/error)
- JS: dock toggle, drawer auto-close timer, context chip updates, theme swatches, pointer-guard selector updates, `updateStageLayout()` guard removal, `showToast(msg, type)`
- Tests: rewrite layout.spec.js for new layout
