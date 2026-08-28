# 🌌 Kinetic Particle Sculpture — 3D Particle Simulation Engine

An interactive, high-performance 3D kinetic particle sculpture engine built with **Three.js**, **GLSL Shaders**, **Web Audio**, and **Web Workers**.

Type any message, pick an emoji, or load an image, and watch it materialize into thousands of luminous particles that respond fluidly to gesture-driven ripples, sound frequency harmonics, and physics kinematics.

---

## 🛠️ Tech Stack

The project is a **vanilla JS/HTML** app (no component framework) built around a dual-engine rendering pipeline that keeps 60 FPS at 30k+ particles.

- **Three.js** — 3D scene graph, orthographic camera, and GPU-accelerated particle rendering
- **GLSL Vertex Shaders** — hardware-accelerated per-particle styling, heat maps, and motion (`js/shaders.js`)
- **Web Workers** — multi-threaded physics fallback with zero-copy double-buffered `Float32Array` slots (`js/physics.worker.js`)
- **Shared Math Kernel** — `js/physics-math.js` is the single source of truth for kinematics, used by both the Web Worker and the CPU fallback so trajectories stay identical
- **Web Audio API** — procedural audio synthesis for all 6 presets (ocean waves, tornado howl, breeze, blast, torus drone, starling flutter) (`js/audio.js`)
- **Tailwind CSS v4** — utility-first UI styling with custom `@theme` tokens and `@custom-variant` state utilities, processed at build time via the `@tailwindcss/vite` plugin
- **Vite 5** — fast dev server and production builds, with shareable state via URL query params
- **Playwright** — end-to-end smoke, performance, and interaction tests (14 specs) driven through a `window.__artzDebug` test hook
- **GitHub Pages** — static deployment of the built `dist/`

---

## ✨ Features

- **🌊 Hover Ripples ("Rock Throw")** — the cursor is a stone on a pond instead of a repulsion pump. Fast sweeps drop *skipping stones* whose amplitude scales with pointer speed; a quick tap throws a *pebble*; **press-and-hold charges a rock** (the native arrow stays the default pointer; pressing on the canvas swaps it for a 16px ring that swells to ~70px as the charge fills, then hands back to the arrow on release) and releasing throws a splash whose height, ring width, and reach all scale with the charge. Rings expand through the sculpture as smooth wavefronts with light flashes, then springs carry every particle home. Triple-tap explodes — the first two taps ping a small, quick ring marker at the tap point. Drag > 8px cancels a charge (rotation stays clean); the effect is disabled during animations. Implemented as a shared kernel in `js/physics-math.js` consumed by both the Web Worker and CPU fallback, with a wavefront-glow mirror in the vertex shader.
- **🎯 Message Types** — a dedicated selector (Text / Emoji / Image) that reveals the matching input: a text field, a roster of pre-selected emojis, or a system file picker. Returning to Text after an emoji/image pick restores your last typed message; Emoji and Image modes remember their last choice and re-render it when you return, or show an empty stage until one is made.
- **🪟 Focus Stage UI** — a full-viewport canvas with a floating frosted-glass dock on desktop (collapsible to a minimal bar) and a slide-in drawer on mobile that auto-closes 1s after a selection. The dock is organized into **Object** (Content · Theme · Font) and **Animations** (Simulations · Sound) side by side, with **Instructions** (Rotate · Zoom · Splash — sweep or hold & release · Explode — Triple-tap · Space) and **Sharing** (Capture · Share) sharing the row below; picking an animation tucks the menu away and restores it when it finishes — the same menu procedure applies whether it's sparked by the Animations chip, Triple-tap, or Space. While an animation runs, the context line names it. Click/tap the **KINETICS** wordmark to start an endless title-flourish showcase that plays a ripple cascade, a particle dissolve-and-reform, a staggered gravity drop, and a black hole singularity implosion with quantum burst back to back; click again to stop it (skipped with reduced motion).
- **⚡ Multi-Style Particle Kinematics**:
  - **💥 Explode**: Volumetric 3D spherical blast with apex hang-time and 2x accelerated power in-fall.
  - **🌪️ Tornado**: Procedural 4-phase swirling vortex funnel with dynamic spin velocity, crown flare, and column meander.
  - **💨 Breeze**: Boundary-layer fluid dynamics with Kelvin-Helmholtz rolling vortices, randomized left/right wind direction, and variable gust intensities.
  - **⚡ Kinetic**: Continuous 3D trochoidal ocean surf wave sweeping across the sculpture.
  - **⭕ Torus**: Magnetic Tokamak Fusion Reactor & Solar Plasma Donut — magnetic pinch compression, 3-strand helical coil confinement ($q = 4.2$), pulsating coronal solar flares with Lorentz loops, 360° turntable yaw rotation, and cold fusion re-crystallization landing.
  - **🐦 Murmuration**: 3D diffused volumetric starling blobs — dynamic aerodynamic stretching along flight velocity, 2 distinct independent flanking pods that converge and merge mid-flight into one giant super-blob, subsequent re-separation, fluid-like 3D convolution, and per-simulation organic random elements.
- **🎨 Dynamic Themes & Custom Fonts**:
  - 5 rich color themes (**Ember**, **Arctic**, **Toxic**, **Neon**, **Sakura**) with vertical spatial gradients, hover glows, and visual gradient swatches.
  - Google Fonts integration (**Outfit**, **Fira Code**, **Pacifico**, **Playfair Display**) with automatic preloading and canvas rasterization.
- **🖼️ Emoji & Image Sampling**:
  - High-density raster sampling that preserves source colors, glyph features, and transparency masks.
- **🚀 High-Performance Dual-Engine Architecture**:
  - Hardware-accelerated GLSL vertex shaders for 60+ FPS rendering.
  - Multi-threaded Web Worker CPU fallback with double-buffered physics slots.

