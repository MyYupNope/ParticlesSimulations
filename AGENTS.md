# Agent Notes

## Path safety (mandatory)
- Always construct `edit`/`write`/`read` file paths by copying them **verbatim** from a prior tool result (`Read` output header, `Glob` hit, or a previous successful edit) — never retype them from memory.
- Project root is exactly `C:\Coding\ParticlesSimulations\`. Any path not starting with that prefix is wrong; stop and re-check before calling the tool.
- For shell commands, prefer relative paths with the `workdir` parameter set to the project root instead of absolute paths.
- If a tool call is rejected for being outside the workspace, do NOT retry with variations — re-read the target file first to obtain its exact path.

## Project conventions
- Physics kernels live in `js/physics-math.js` (shared CPU/worker evaluators) and are mirrored in the inline GLSL vertex shader in `js/main.js`. Any kinematics change must be applied to BOTH files in identical form (same constants, same formulas). Verify parity with `Select-String` on the changed constant names.
- After any kernel edit: `node --check` both files, `npm run build`, then verify visually via a Playwright probe against `http://localhost:5173/ParticlesSimulations/` (dev server binds IPv6 — use `localhost`, never `127.0.0.1`).
- Numeric continuity check convention: max frame-to-frame jump = 2.5u at cd=1.0 and cd=1.27, home-return error = 1e-10 at t=total+0.5s.
- Full test battery (`npm test`) is deferred until the user asks for commit; quick gate is `npx playwright test tests/patterns.spec.js`.
- When the user asks to "commit", this always means the full workflow: run `npm test`, commit changes, push to remote (`git push origin main`), and deploy to live (`npm run deploy`).
- Scratch/debug scripts go in the repo root as `.tmp.mjs` (node resolves @playwright/test from project node_modules) and must be deleted after use. Screenshots go to `C:\Users\rodri\AppData\Local\Temp\opencode\shots\`.

## Encoding safety (mandatory)
- NEVER run blanket encoding-repair passes (cp1252→UTF8 re-decode) over healthy files: .NET's cp1252 encoder silently substitutes `?` for any character it cannot map (emoji, box-drawing, Greek), destroying content while appearing to "succeed". Only ever repair files KNOWN to be mojibake-corrupted, and verify each repaired run afterward.
- Console output renders non-ASCII as `?` — never use printed `?` as evidence of file corruption. Inspect actual char codes (e.g., `[int][char]` dumps) instead. Note that JS ternary `? :` operators are legitimate ASCII and will match naive `?` searches.
