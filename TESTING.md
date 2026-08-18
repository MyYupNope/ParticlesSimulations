# Artz Test Plan

Automated browser tests for the artz kinetic particle sculpture. Runs against the
**production build** served by `vite preview`, so worker URL resolution and the `/artz/`
base path match the deployed GitHub Pages environment.

## Environment

- **Runner:** Playwright (`@playwright/test`)
- **Browser:** Chromium (headless, software WebGL via `--use-angle=swiftshader`)
- **Server:** `vite preview` at `http://127.0.0.1:4173/artz/`

### Quick start

```powershell
npm run test         # build + full browser suite (recommended)
npm run test:e2e     # run existing build (skips rebuild)
npm run test:headed  # run in a visible browser window
npx playwright show-report   # view the HTML report
```

### Setup (one time)

```powershell
npm install -D @playwright/test
npx playwright install chromium
```

## Coverage

| File | Focus | Validates |
|---|---|---|
| `tests/smoke.spec.js` | Load / render / animation | Page boots, canvas draws, particles exist, positions animate, text rebuild works |
| `tests/performance.spec.js` | Live frame rate, capture, stress | RAF loop alive, screenshot download, frequent explosions/edits produce no unhandled errors |
| `tests/memory.spec.js` | Resource lifecycle | Geometry count stays bounded across 40 rebuilds (GPU disposal regression guard) |
| `tests/worker.spec.js` | Worker + fallback | Default worker path active; `?noworker=1` CPU fallback animates from valid arrays; worker survives explosions |

## Test scenarios (manual matrix for real hardware)

Headless software WebGL cannot validate real GPU fill-rate or mobile behavior. On
target hardware, repeat these in Chrome DevTools **Performance**:

1. Idle (10s), pointer movement (10s), one explosion, repeated explosions.
2. Text edits, font changes, theme changes, history back/forward.
3. Particle counts: 5k / 15k / 30k (type short vs 25-char messages).
4. Screenshot capture during idle and during an explosion.
5. DPR 1 and DPR 2 (adaptive quality should drop resolution under sustained load).
6. `?noworker=1` on low-end hardware (fallback should animate at reduced budget).
7. Monitor `window.__artzDebug.geometryCount` and texture count for stability.

## Debug hook

`main.js` exposes a small, production-safe debug API used by the tests:

```js
window.__artzDebug = {
    particleCount,      // particles.posLive.length / 3
    usingWorker,        // physicsWorker present/active
    geometryCount,      // renderer.info.memory.geometries
    textureCount,       // renderer.info.memory.textures
    renderCalls,        // renderer.info.render.calls
    triggerExplosion,   // programmatic blast
}
```

## Budgets

- 60 FPS on desktop at ~30k particles where the GPU allows.
- At least 30 FPS on mid-range mobile during an explosion.
- Stable `geometryCount` after repeated edits (enforced by `tests/memory.spec.js`).
- No unhandled page errors during smoke/stress scenarios.
