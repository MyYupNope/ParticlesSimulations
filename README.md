# 🌌 Kinetic Particle Sculpture — 3D Particle Simulation Engine

An interactive, high-performance 3D kinetic particle sculpture engine built with **Three.js**, **GLSL Shaders**, **Web Audio**, and **Web Workers**.

Type any message, pick an emoji, or load an image, and watch it materialize into thousands of luminous particles that respond fluidly to mouse interaction, sound frequency harmonics, and physics kinematics.

---

## 🛠️ Tech Stack

- **Three.js** — 3D scene graph, camera, and GPU-accelerated particle rendering
- **GLSL Vertex Shaders** — hardware-accelerated per-particle styling and motion
- **Web Workers** — multi-threaded physics fallback with double-buffered slots
- **Web Audio API** — procedural audio synthesis (ocean waves, harmonics)
- **Tailwind CSS v4** — utility-first UI styling with custom theme tokens
- **Vite** — fast dev server and production builds
- **Playwright** — end-to-end smoke, performance, and interaction tests
- **GitHub Pages** — static deployment of the built `dist/`

---

## ✨ Features

- **🎯 Message Types** — a dedicated selector (Text / Emoji / Image) that reveals the matching input: a text field, a roster of pre-selected emojis, or a system file picker. Returning to Text after an emoji/image pick restores your last typed message; Emoji and Image modes remember their last choice and re-render it when you return, or show an empty stage until one is made.
- **🪟 Focus Stage UI** — a full-viewport canvas with a floating frosted-glass dock on desktop (collapsible to a minimal bar) and a slide-in drawer on mobile that auto-closes 1s after a selection. The dock is organized into **Object** (Content · Theme · Font) and **Animations** (Simulations · Sound) side by side, with **Instructions** (Rotate · Zoom · Explode) and **Sharing** (Capture · Share) sharing the row below; picking an animation tucks the menu away and restores it when it finishes. Click/tap the **KINETICS** wordmark to play a particle dissolve-and-reform title flourish (skipped with reduced motion).
- **⚡ Multi-Style Particle Kinematics**:
  - **💥 Explode**: Volumetric 3D spherical blast with apex hang-time and 2x accelerated power in-fall.
  - **🌪️ Tornado**: Procedural 4-phase swirling vortex funnel with dynamic spin velocity, crown flare, and column meander.
  - **💨 Breeze**: Boundary-layer fluid dynamics with Kelvin-Helmholtz rolling vortices, randomized left/right wind direction, and variable gust intensities.
  - **⚡ Kinetic**: Continuous 3D trochoidal ocean surf wave sweeping across the sculpture.
- **🎨 Dynamic Themes & Custom Fonts**:
  - 5 rich color themes (**Ember**, **Arctic**, **Toxic**, **Neon**, **Sakura**) with vertical spatial gradients, hover glows, and visual gradient swatches.
  - Google Fonts integration (**Outfit**, **Fira Code**, **Pacifico**, **Playfair Display**) with automatic preloading and canvas rasterization.
- **🖼️ Emoji & Image Sampling**:
  - High-density raster sampling that preserves source colors, glyph features, and transparency masks.
- **🚀 High-Performance Dual-Engine Architecture**:
  - Hardware-accelerated GLSL vertex shaders for 60+ FPS rendering.
  - Multi-threaded Web Worker CPU fallback with double-buffered physics slots.

