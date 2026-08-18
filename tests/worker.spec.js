import { test, expect } from '@playwright/test';
import { waitForRender, samplePositions } from './helpers';

test('physics runs on a Web Worker by default', async ({ page }) => {
    await page.goto('/');
    await waitForRender(page);
    expect(await page.evaluate(() => window.__artzDebug.usingWorker)).toBe(true);
});

test('?noworker=1 forces a working CPU fallback', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));

    await page.goto('/?noworker=1');
    await waitForRender(page);

    expect(await page.evaluate(() => window.__artzDebug.usingWorker)).toBe(false);

    // Fallback path must still produce explosion motion from valid (non-detached) arrays.
    await page.evaluate(() => window.__artzDebug.triggerExplosion());
    const a = await samplePositions(page, 24);
    await page.waitForTimeout(300);
    const b = await samplePositions(page, 24);
    let changed = 0;
    for (let i = 0; i < a.length; i++) {
        if (Math.abs(a[i] - b[i]) > 1e-6) changed++;
    }
    expect(changed).toBeGreaterThan(0);
    expect(errors).toEqual([]);
});

test('worker path survives repeated explosions without crashing', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));

    await page.goto('/');
    await waitForRender(page);

    for (let i = 0; i < 8; i++) {
        await page.evaluate(() => window.__artzDebug.triggerExplosion());
        await page.waitForTimeout(250);
    }

    expect(await page.evaluate(() => window.__artzDebug.usingWorker)).toBe(true);
    expect(errors).toEqual([]);
});
