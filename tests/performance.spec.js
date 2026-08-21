import { test, expect } from '@playwright/test';
import { waitForRender } from './helpers';

// Measures average FPS over ~3 seconds. The headless software rasterizer (SwiftShader)
// is far slower than a real GPU, so this is a sanity check that the loop keeps running
// rather than a performance gate.
async function measureFps(page, ms = 3000) {
    return page.evaluate((duration) => new Promise((resolve) => {
        let frames = 0;
        const start = performance.now();
        (function tick() {
            frames++;
            if (performance.now() - start >= duration) {
                resolve(Math.round(frames / (duration / 1000)));
                return;
            }
            requestAnimationFrame(tick);
        })();
    }), ms);
}

test('animation loop delivers a live frame rate', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await waitForRender(page);

    const fps = await measureFps(page, 3000);
    // Generous floor — the goal is to catch a frozen loop, not a slow machine.
    expect(fps).toBeGreaterThan(3);
});

test('screenshot capture produces a PNG download', async ({ page }) => {
    await page.goto('/');
    await waitForRender(page);

    const downloadPromise = page.waitForEvent('download');
    await page.click('#dock .capture-btn');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.png');
});
