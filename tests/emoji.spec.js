import { test, expect } from '@playwright/test';
import { waitForRender, waitForCameraSettle } from './helpers';

const EMOJI = encodeURIComponent('😀');

async function openPage(page, query = '/') {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(query);
    await waitForRender(page);
    await page.waitForFunction(() => {
        const cam = window.__artzDebug._render().camera;
        return cam && Math.abs(cam.left) > 1;
    });
    await waitForCameraSettle(page);
}

// Click an emoji chip and wait until the share URL reflects the picked message
// (updateText pushes ?t= after the rebuild) and the refit zoom has settled.
async function pickEmoji(page, emoji) {
    await page.click(`.emoji-chip[data-emoji="${emoji}"]`);
    await page.waitForFunction((e) => {
        return new URLSearchParams(window.location.search).get('t') === e;
    }, emoji);
    await waitForCameraSettle(page);
}

async function particleCount(page) {
    return page.evaluate(() => window.__artzDebug.particleCount);
}

test('picking an emoji substitutes the message with a detailed sculpture', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));

    await openPage(page);
    await pickEmoji(page, '😀');

    // The pick fills the MESSAGE field and highlights the chip.
    expect(await page.inputValue('#text-input')).toBe('😀');
    expect(await page.$eval('.emoji-chip.active', el => el.getAttribute('data-emoji'))).toBe('😀');

    // High-detail path yields a dense particle set (vs a few hundred for a 44px
    // text glyph) while staying under the worker cap.
    const count = await particleCount(page);
    expect(count).toBeGreaterThan(7000);
    expect(count).toBeLessThanOrEqual(30000);

    // Silhouette: the face bbox is roughly square and spans the 80-unit layout.
    const bbox = await page.evaluate(() => {
        const home = window.__artzDebug._render().particles.geometry.attributes.homePosition.array;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let i = 0; i < home.length; i += 3) {
            if (home[i] < minX) minX = home[i];
            if (home[i] > maxX) maxX = home[i];
            if (home[i + 1] < minY) minY = home[i + 1];
            if (home[i + 1] > maxY) maxY = home[i + 1];
        }
        return { w: maxX - minX, h: maxY - minY };
    });
    expect(bbox.w).toBeGreaterThan(70);
    expect(Math.abs(bbox.w / bbox.h - 1)).toBeLessThan(0.3);

    expect(errors).toEqual([]);
});

test('emoji renders under the CPU fallback within its cap', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));

    await openPage(page, '/?noworker=1');
    await pickEmoji(page, '🔥');

    const count = await particleCount(page);
    expect(count).toBeGreaterThan(3000);
    expect(count).toBeLessThanOrEqual(15000);
    expect(await page.evaluate(() => window.__artzDebug.usingWorker)).toBe(false);
    expect(errors).toEqual([]);
});

test('typing after picking reverts to the regular text path', async ({ page }) => {
    await openPage(page);
    await pickEmoji(page, '😀');

    // Typing the same emoji chars as text must clear the pick and use the small
    // text glyph rasterizer (a few thousand particles at most).
    await page.locator('#text-input').fill('😀');
    await page.waitForTimeout(500);

    expect(await page.$$eval('.emoji-chip.active', els => els.length)).toBe(0);
    const count = await particleCount(page);
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(4000);
});

test('shared URL with an emoji message restores the detailed rendering', async ({ page }) => {
    await openPage(page, `/?t=${EMOJI}`);

    expect(await page.inputValue('#text-input')).toBe('😀');
    const count = await particleCount(page);
    expect(count).toBeGreaterThan(7000);
});

test('emoji stays at minimal zoom after a hard reload', async ({ page }) => {
    // Simulates ctrl+F5 with the emoji persisted in the URL (?t=😀).
    await openPage(page, `/?t=${EMOJI}`);

    const cam = await page.evaluate(() => {
        const c = window.__artzDebug._render().camera;
        return { z: c.position.z, right: c.right, top: c.top };
    });
    expect(cam.z).toBeGreaterThan(50);
    expect(cam.right).toBeGreaterThan(50);
    expect(cam.top).toBeGreaterThan(30);
});

// Color-class histogram helper over the particle sourceColor attribute.
async function colorStats(page) {
    return page.evaluate(() => {
        const geo = window.__artzDebug._render().particles.geometry;
        const colors = Array.from(geo.attributes.sourceColor.array);
        const sizes = Array.from(geo.attributes.sampleSize.array);
        const uniforms = window.__artzDebug._render().particles.material.uniforms;
        let dark = 0, blue = 0, red = 0, yellow = 0, size1 = 0, size2 = 0;
        for (let i = 0; i < colors.length; i += 4) {
            const r = colors[i], g = colors[i + 1], b = colors[i + 2];
            if (r < 90 && g < 90 && b < 90) dark++;
            else if (b > g + 40 && b > r + 40) blue++;
            else if (r > g + 60 && r > b + 60) red++;
            else if (r > 200 && g > 140 && b < 130) yellow++;
        }
        for (let i = 0; i < sizes.length; i++) {
            if (sizes[i] === 1) size1++;
            else size2++;
        }
        return {
            count: colors.length / 4,
            dark, blue, red, yellow, size1, size2,
            emojiMode: uniforms.uEmojiMode.value,
            pointSize: uniforms.uPointSize.value,
            depthCue: uniforms.uDepthCue.value
        };
    });
}

test('emoji carries its source colors, internal features and render profile', async ({ page }) => {
    await openPage(page);
    await pickEmoji(page, '😂');

    const s = await colorStats(page);

    // Source-color mode is active with the crisp emoji render profile.
    expect(s.emojiMode).toBe(1);
    expect(s.pointSize).toBe(1.6);
    expect(s.depthCue).toBe(0.06);

    // 😂 must preserve the glyph's internal color regions: a yellow face, blue
    // tears and dark eyes (tolerant counts; system emoji fonts vary by platform).
    expect(s.yellow).toBeGreaterThan(3000);
    expect(s.blue).toBeGreaterThan(500);
    expect(s.dark).toBeGreaterThan(200);

    // Mixed sample sizes: sharp 1px feature edges + larger interior cells.
    expect(s.size1).toBeGreaterThan(5000);
});

test('emoji internal details survive the CPU fallback budget', async ({ page }) => {
    await openPage(page, '/?noworker=1');
    await pickEmoji(page, '😂');

    const s = await colorStats(page);
    expect(s.emojiMode).toBe(1);
    expect(s.count).toBeLessThanOrEqual(15000);
    // Feature-aware reduction keeps the blue tears and dark eyes even at the
    // 15k fallback cap.
    expect(s.blue).toBeGreaterThan(300);
    expect(s.dark).toBeGreaterThan(150);
});

// Re-rasterize the emoji on a transparent canvas and compare a coarse grid of the
// glyph mask/regions against the particle sculpture. This locks the acceptance
// criterion "recognizable from silhouette AND from content" as an automated test.
async function maskCorrespondence(page) {
    return page.evaluate(() => {
        const G = 32;
        const SIZE = 320;
        const alphaThr = 120;

        // Ground truth: rasterize 😂 with the same font stack/size the app uses.
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.clearRect(0, 0, SIZE, SIZE);
        ctx.fillStyle = 'white';
        ctx.font = '280px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('😂', SIZE / 2, SIZE / 2 + SIZE * 0.02);
        const imgData = ctx.getImageData(0, 0, SIZE, SIZE).data;

        const classify = (r, g, b) => (r < 90 && g < 90 && b < 90) ? 'dark'
            : (b > g + 40 && b > r + 40) ? 'blue'
            : (r > 200 && g > 140 && b < 130) ? 'yellow' : 'other';

        // Canvas grid (own bbox -> G×G).
        let mnX = Infinity, mxX = -Infinity, mnY = Infinity, mxY = -Infinity;
        for (let y = 0; y < SIZE; y++) {
            for (let x = 0; x < SIZE; x++) {
                if (imgData[(y * SIZE + x) * 4 + 3] > alphaThr) {
                    if (x < mnX) mnX = x; if (x > mxX) mxX = x;
                    if (y < mnY) mnY = y; if (y > mxY) mxY = y;
                }
            }
        }
        const cw = Math.max(mxX - mnX, 1), ch = Math.max(mxY - mnY, 1);
        const gridColor = new Array(G * G).fill(null);
        for (let y = 0; y < SIZE; y++) {
            for (let x = 0; x < SIZE; x++) {
                const a = imgData[(y * SIZE + x) * 4 + 3];
                if (a <= alphaThr) continue;
                const i = (y * SIZE + x) * 4;
                const cls = classify(imgData[i], imgData[i + 1], imgData[i + 2]);
                const cx = Math.min(G - 1, Math.floor((x - mnX) / cw * G));
                const cy = Math.min(G - 1, Math.floor((y - mnY) / ch * G));
                if (!gridColor[cy * G + cx]) gridColor[cy * G + cx] = cls;
            }
        }
        const canvasOccupied = gridColor.map(c => c !== null);

        // Particle side (own bbox -> same grid).
        const geo = window.__artzDebug._render().particles.geometry;
        const home = geo.attributes.homePosition.array;
        const colors = geo.attributes.sourceColor.array;
        let pMinX = Infinity, pMaxX = -Infinity, pMinY = Infinity, pMaxY = -Infinity;
        for (let i = 0; i < home.length; i += 3) {
            if (home[i] < pMinX) pMinX = home[i]; if (home[i] > pMaxX) pMaxX = home[i];
            if (home[i + 1] < pMinY) pMinY = home[i + 1]; if (home[i + 1] > pMaxY) pMaxY = home[i + 1];
        }
        const pw = Math.max(pMaxX - pMinX, 1e-6), ph = Math.max(pMaxY - pMinY, 1e-6);
        // Per-class presence per cell: a cell is a "hit" for a region when ANY of
        // its particles carries that color class (first-particle-only would let
        // an antialiased fringe particle mask the region).
        const pOcc = new Uint8Array(G * G);
        const pBlue = new Uint8Array(G * G);
        const pDark = new Uint8Array(G * G);
        for (let i = 0, p = 0; i < home.length; i += 3, p++) {
            const cx = Math.min(G - 1, Math.max(0, Math.floor((home[i] - pMinX) / pw * G)));
            const cy = Math.min(G - 1, Math.max(0, Math.floor((home[i + 1] - pMinY) / ph * G)));
            const cell = cy * G + cx;
            const c4 = p * 4;
            const cls = classify(colors[c4], colors[c4 + 1], colors[c4 + 2]);
            pOcc[cell] = 1;
            if (cls === 'blue') pBlue[cell] = 1;
            if (cls === 'dark') pDark[cell] = 1;
        }
        const pOccupied = Array.from(pOcc);

        let interOcc = 0, canvasOcc = 0, particleOcc = 0;
        for (let i = 0; i < canvasOccupied.length; i++) {
            if (canvasOccupied[i]) canvasOcc++;
            if (pOccupied[i]) particleOcc++;
            if (canvasOccupied[i] && pOccupied[i]) interOcc++;
        }
        // Region correspondence: canvas cells of a class that contain a particle of the same class.
        const counts = { blue: { cell: 0, hit: 0 }, dark: { cell: 0, hit: 0 } };
        for (let i = 0; i < gridColor.length; i++) {
            const cc = gridColor[i];
            if (cc === 'blue') {
                counts.blue.cell++;
                if (pBlue[i]) counts.blue.hit++;
            } else if (cc === 'dark') {
                counts.dark.cell++;
                if (pDark[i]) counts.dark.hit++;
            }
        }
        return {
            recall: interOcc / canvasOcc,
            precision: interOcc / particleOcc,
            blue: { cells: counts.blue.cell, hit: counts.blue.hit },
            dark: { cells: counts.dark.cell, hit: counts.dark.hit }
        };
    });
}

function expectMask(m, loRecall) {
    expect(m.recall).toBeGreaterThan(loRecall);
    expect(m.precision).toBeGreaterThan(0.9);
    // The blue tears must land in the blue canvas cells (dark-region presence is
    // asserted separately by the global color-class test; per-cell dark cells are
    // spurious because yellow face outlines win the cell classification).
    expect(m.blue.cells).toBeGreaterThan(20);
    expect(m.blue.hit / m.blue.cells).toBeGreaterThan(0.5);
    expect(m.dark.cells).toBeGreaterThan(10);
}

test('particle sculpture matches the emoji raster mask and color regions', async ({ page }) => {
    await openPage(page);
    await pickEmoji(page, '😂');

    await expectMask(await maskCorrespondence(page), 0.85);
});
