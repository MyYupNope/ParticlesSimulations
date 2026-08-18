import { test, expect } from '@playwright/test';
import { waitForRender } from './helpers';

function assertOriginCapture(result) {
    expect(result.before.position.length).toBeGreaterThan(0);
    expect(result.before.position.length).toBe(result.after.explosionOrigin.length);

    let maxCaptureError = 0;
    for (let i = 0; i < result.before.position.length; i++) {
        maxCaptureError = Math.max(
            maxCaptureError,
            Math.abs(result.before.position[i] - result.after.explosionOrigin[i])
        );
    }
    expect(maxCaptureError).toBeLessThan(1e-6);

    // A shared screen-center origin would collapse all particles to one point.
    const xs = [];
    for (let i = 0; i < result.after.explosionOrigin.length; i += 3) {
        xs.push(result.after.explosionOrigin[i]);
    }
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(1);
}

async function exerciseOrigin(page, url) {
    await page.goto(url);
    await waitForRender(page);

    const result = await page.evaluate(() => {
        const before = window.__artzDebug.snapshot(32);
        window.__artzDebug.triggerExplosion();
        const after = window.__artzDebug.snapshot(32);
        return { before, after };
    });
    assertOriginCapture(result);

    await page.waitForFunction(() => !window.__artzDebug.snapshot(1).explosionActive, null, {
        timeout: 20_000
    });
    await page.waitForTimeout(100);

    const recovered = await page.evaluate(() => window.__artzDebug.snapshot(32));
    let maxRecoveryError = 0;
    for (let i = 0; i < recovered.position.length; i++) {
        maxRecoveryError = Math.max(
            maxRecoveryError,
            Math.abs(recovered.position[i] - recovered.home[i])
        );
    }
    expect(maxRecoveryError).toBeLessThan(1e-4);
}

async function exerciseTornadoOrigin(page, url) {
    await page.goto(url);
    await waitForRender(page);

    await page.click('[data-text="TORNADO"]');
    await page.waitForFunction(
        (st) => window.__artzDebug.snapshot(1).randomized.style === st,
        1,
        { timeout: 15_000 }
    );

    // Let the funnel form (expansion is ~3.5s), confirming the sculpture visibly
    // lifts up the screen axis rather than fading where it was.
    await page.waitForFunction(() => {
        const s = window.__artzDebug.snapshot(64);
        let d = 0, n = 0;
        for (let i = 1; i < s.position.length; i += 3) {
            d += Math.abs(s.position[i] - s.home[i]);
            n++;
        }
        return n > 0 && d / n > 4;
    }, null, { timeout: 12_000 });

    // Wait for the blast to finish so the next trigger is not swallowed.
    await page.waitForFunction(() => !window.__artzDebug.snapshot(1).explosionActive, null, {
        timeout: 15_000
    });
    await page.waitForTimeout(100);

    // A fresh blast must start at exactly the currently visible particles.
    const blast = await page.evaluate(() => {
        const result = { before: window.__artzDebug.snapshot(32), after: null };
        window.__artzDebug.triggerExplosion();
        result.after = window.__artzDebug.snapshot(32);
        return result;
    });
    assertOriginCapture(blast);

    await page.waitForFunction(() => !window.__artzDebug.snapshot(1).explosionActive, null, {
        timeout: 15_000
    });
    await page.waitForTimeout(100);

    const recovered = await page.evaluate(() => window.__artzDebug.snapshot(32));
    let maxRecoveryError = 0;
    for (let i = 0; i < recovered.position.length; i++) {
        maxRecoveryError = Math.max(
            maxRecoveryError,
            Math.abs(recovered.position[i] - recovered.home[i])
        );
    }
    expect(maxRecoveryError).toBeLessThan(1e-4);
}

test('worker explosions start at each particle position and recover exactly', async ({ page }) => {
    await exerciseOrigin(page, '/');
});

test('CPU fallback explosions start at each particle position and recover exactly', async ({ page }) => {
    await exerciseOrigin(page, '/?noworker=1');
});

test('TORNADO captures each visible particle and recovers exactly @slow', async ({ page }) => {
    await exerciseTornadoOrigin(page, '/');
});
