import { test, expect } from '@playwright/test';
import { setText, waitForRender, particleCount } from './helpers';

test('page loads and renders a particle sculpture', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));

    await page.goto('/');
    await waitForRender(page);

    await expect(page.locator('canvas')).toBeVisible();
    const count = await particleCount(page);
    expect(count).toBeGreaterThan(0);
    expect(errors).toEqual([]);
});

test('idle text remains straight and stable', async ({ page }) => {
    await page.goto('/');
    await waitForRender(page);

    const a = await page.evaluate(() => window.__artzDebug.snapshot(8));
    await page.waitForTimeout(300);
    const b = await page.evaluate(() => window.__artzDebug.snapshot(8));

    let maxDelta = 0;
    for (let i = 0; i < a.position.length; i++) {
        maxDelta = Math.max(maxDelta, Math.abs(a.position[i] - b.position[i]));
    }
    expect(maxDelta).toBeLessThan(1e-4);
    expect(b.rotation).toEqual([0, 0, 0]);
});

test('orthographic projection renders depth without keystone shear', async ({ page }) => {
    await page.goto('/');
    await waitForRender(page);

    const result = await page.evaluate(() => {
        const snap = window.__artzDebug.snapshot(96);
        const camera = window.__artzDebug._render().camera;
        const e = camera.projectionMatrix.elements;

        // NDC x computed from the real projection matrix: with an orthographic
        // matrix the x row has no z term and w = 1, so depth cannot shear any
        // off-center glyph horizontally (the perspective keystone artifact).
        let maxZCoupling = 0;
        for (let i = 0; i + 2 < snap.position.length; i += 3) {
            const x = snap.position[i];
            const z = snap.position[i + 2];
            const clipX = x * e[0] + z * e[8] + e[12];
            const clipW = z * e[11] + e[15];
            const ndcX = clipX / clipW;
            const ideal = (x * e[0] + e[12]) / e[15];
            maxZCoupling = Math.max(maxZCoupling, Math.abs(ndcX - ideal));
        }

        // Depth must be restored (jitterZ 2.5), so resting positions carry volume.
        let minZ = Infinity, maxZ = -Infinity;
        for (let i = 2; i < snap.home.length; i += 3) {
            minZ = Math.min(minZ, snap.home[i]);
            maxZ = Math.max(maxZ, snap.home[i]);
        }
        return { isOrtho: camera.isOrthographicCamera, maxZCoupling, zSpread: maxZ - minZ };
    });

    expect(result.isOrtho).toBe(true);
    expect(result.maxZCoupling).toBeLessThan(1e-6);
    expect(result.zSpread).toBeGreaterThan(1);
});

test('changing the text rebuilds with a bounded particle count', async ({ page }) => {
    await page.goto('/');
    await waitForRender(page);

    await setText(page, 'HELLO');
    await waitForRender(page);
    const count = await particleCount(page);
    expect(count).toBeGreaterThan(0);
    // 30k hard ceiling (worker path).
    expect(count).toBeLessThanOrEqual(30000);
});
