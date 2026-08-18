import { test, expect } from '@playwright/test';
import { waitForRender, setText, geometryCount } from './helpers';

// Regression test for Phase 3 (GPU resource disposal): repeated text/font changes
// must not grow the WebGL geometry count — otherwise we're leaking resources.
test('geometry count stays stable after many rebuilds @slow', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/');
    await waitForRender(page);

    // Allow the initial count to settle (particles + trails + embers).
    const baseline = await geometryCount(page);
    console.log(`baseline geometries: ${baseline}`);
    expect(baseline).toBeGreaterThan(0);

    // 20 rebuilds with disposal in place should keep the count bounded.
    let peak = baseline;
    for (let i = 0; i < 20; i++) {
        await setText(page, `MSG${i}`);
        await waitForRender(page);
        const g = await geometryCount(page);
        if (g > peak) peak = g;
    }

    console.log(`peak geometries after 40 rebuilds: ${peak}`);
    // Small tolerance: allow a transient program reuse, but no unbounded growth.
    expect(peak).toBeLessThanOrEqual(baseline + 4);
});
