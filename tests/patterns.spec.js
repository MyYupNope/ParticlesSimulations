import { test, expect } from '@playwright/test';
import { waitForRender } from './helpers';

// The worker (and CPU fallback) echo the generated blast directions back to the
// main thread (see DIRECTIONS_VERIFY). Patterns are verified from those direction
// vectors directly — deterministic and immune to the frame-rate/timing jitter of
// headless software WebGL under parallel load. Expected styles:
// 0 = EXPLODE (uniform sphere), 1 = TORNADO (screen-space funnel in X/Z swirl
// with screen-up Y lift), 2 = BREEZE (strong coherent gust), 3 = KINETIC rays,
// 4 = TORUS (trefoil torus knot), 5 = MURMURATION (flock).
async function getPattern(page, url, chip, expectedStyle) {
    await page.goto(url);
    await waitForRender(page);
    await page.click(`[data-text="${chip}"]`);
    await page.waitForFunction(
        (st) => window.__artzDebug.snapshot(1).randomized.style === st,
        expectedStyle,
        { timeout: 15_000 }
    );

    const res = await page.evaluate((n) => {
        const s = window.__artzDebug.snapshot(n);
        return { dirs: s.randomized.dirs, home: s.home };
    }, 384);

    const dirs = [];
    for (let i = 0; i + 2 < res.dirs.length; i += 3) {
        dirs.push([res.dirs[i], res.dirs[i + 1], res.dirs[i + 2]]);
    }
    const homes = [];
    for (let i = 0; i + 2 < res.home.length; i += 3) {
        homes.push([res.home[i], res.home[i + 1], res.home[i + 2]]);
    }
    return { dirs, homes };
}

function assertExplode(dirs) {
    expect(dirs.length).toBeGreaterThan(50);
    const zs = dirs.map(d => d[2]);
    const zMean = zs.reduce((s, z) => s + z, 0) / zs.length;
    const zStd = Math.sqrt(zs.reduce((s, z) => s + (z - zMean) ** 2, 0) / (zs.length - 1));
    const meanX = dirs.reduce((s, d) => s + d[0], 0) / dirs.length;
    const meanY = dirs.reduce((s, d) => s + d[1], 0) / dirs.length;
    const meanMag = Math.hypot(meanX, meanY, zMean);
    expect(zStd).toBeGreaterThan(0.35);
    expect(meanMag).toBeLessThan(0.25);
}

function assertKinetic(dirs) {
    expect(dirs.length).toBeGreaterThan(50);
}

function assertTornado(dirs, homes) {
    expect(dirs.length).toBeGreaterThan(50);
    let mt = 0, mr = 0, maz = 0, mz = 0;
    for (let i = 0; i < dirs.length; i++) {
        const [dx, dy, dz] = dirs[i];
        const [hx, hy, hz] = homes[i];
        // The camera looks along world Z, so the funnel swirls in the X/Z screen
        // plane while the lift travels up the visible Y axis.
        const r = Math.hypot(hx, hz);
        let tx = 0, tz = 0, radx = 0, radz = 1;
        if (r > 1e-4) {
            radx = hx / r; radz = hz / r;
            tx = -radz; tz = radx;
        }
        mt += Math.abs(dx * tx + dz * tz);
        mr += Math.abs(dx * radx + dz * radz);
        maz += Math.abs(dy);
        mz += dy;
    }
    mt /= dirs.length; mr /= dirs.length; maz /= dirs.length; mz /= dirs.length;
    // A tornado swirls tightly around its Y axis in the visible X/Z plane without
    // blowing outward, and carries the whole sculpture up the screen.
    expect(mt).toBeGreaterThan(0.5);    // swirls in the visible X/Z plane
    expect(mr).toBeLessThan(0.35);      // no outward radial blow-out
    expect(maz).toBeGreaterThan(0.15);  // strong screen-up component
    expect(maz).toBeLessThan(0.85);
    expect(mz).toBeGreaterThan(0.15);   // net screen-up lift
}

function assertFunnelStructure(snap) {
    expect(snap.activeStyle).toBe(1);
    const p = snap.funnelProfile;
    expect(p.height).toBeGreaterThan(0);
    // Broad turbulent crown over a narrow waist over a fading tail.
    expect(p.crownRadius).toBeGreaterThan(p.waistRadius);
    expect(p.waistRadius).toBeGreaterThan(p.tailRadius);
    expect(p.tailRadius).toBeGreaterThan(0);
    expect(p.fadeEnd).toBeGreaterThan(p.fadeStart);
    // The stable per-particle roles span the whole funnel: some particles form the
    // crown, some fall inside the fading tail band.
    const ft = snap.funnelT;
    expect(ft.length).toBeGreaterThan(50);
    expect(Math.max(...ft)).toBeGreaterThan(0.85);
    expect(ft.filter(v => v < p.fadeEnd).length).toBeGreaterThan(0);
}

async function getFunnel(page, url) {
    await page.goto(url);
    await waitForRender(page);
    await page.click(`[data-text="TORNADO"]`);
    await page.waitForFunction(
        (st) => window.__artzDebug.snapshot(1).randomized.style === st,
        1,
        { timeout: 15_000 }
    );
    return page.evaluate(() => window.__artzDebug.snapshot(384));
}

function assertBreeze(dirs) {
    expect(dirs.length).toBeGreaterThan(50);
    const meanX = dirs.reduce((s, d) => s + d[0], 0) / dirs.length;
    const meanY = dirs.reduce((s, d) => s + d[1], 0) / dirs.length;
    const meanZ = dirs.reduce((s, d) => s + d[2], 0) / dirs.length;
    const meanMag = Math.hypot(meanX, meanY, meanZ);
    // High coherence: the whole cloud surges as one strong gust.
    expect(meanMag).toBeGreaterThan(0.7);
    expect(Math.abs(meanZ)).toBeLessThan(0.3);
}

test('EXPLODE preset blasts uniformly in 3D', async ({ page }) => {
    assertExplode((await getPattern(page, '/', 'EXPLODE', 0)).dirs);
});

test('KINETIC preset triggers cleanly in wave matrix mode', async ({ page }) => {
    assertKinetic((await getPattern(page, '/', 'KINETIC', 3)).dirs);
});

test('TORNADO preset swirls particles up into a visible funnel', async ({ page }) => {
    const { dirs, homes } = await getPattern(page, '/', 'TORNADO', 1);
    assertTornado(dirs, homes);
});

test('TORNADO funnel shape has a broad crown over a waist over a fading tail @slow', async ({ page }) => {
    assertFunnelStructure(await getFunnel(page, '/'));
});

test('BREEZE preset flows in one coherent horizontal direction', async ({ page }) => {
    assertBreeze((await getPattern(page, '/', 'BREEZE', 2)).dirs);
});

test('TORUS preset triggers cleanly in trefoil mode', async ({ page }) => {
    const { dirs } = await getPattern(page, '/', 'TORUS', 4);
    expect(dirs.length).toBeGreaterThan(50);
});

test('MURMURATION preset triggers cleanly in flock mode', async ({ page }) => {
    const { dirs } = await getPattern(page, '/', 'MURMURATION', 5);
    expect(dirs.length).toBeGreaterThan(50);
});

test('TORUS runs its full cycle without console errors and recovers', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => pageErrors.push(String(err)));

    await page.goto('/');
    await waitForRender(page);

    await page.click('[data-text="TORUS"]');

    // Assert physics worker remains active without error fallback
    expect(await page.evaluate(() => window.__artzDebug.usingWorker)).toBe(true);

    // Wait for the full ~16s torus knot cycle to complete
    await page.waitForFunction(() => !window.__artzDebug.snapshot(1).explosionActive, null, {
        timeout: 24_000
    });

    // The context line returns to the default hint after the cycle
    await page.waitForFunction(() => {
        const el = document.querySelector('#context-line');
        return el && el.textContent.includes('Type a message');
    }, null, { timeout: 10_000 });

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
});

test('BREEZE triggers cleanly on Web Worker without console errors and recovers promptly', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => pageErrors.push(String(err)));

    await page.goto('/');
    await waitForRender(page);

    // Trigger Breeze preset
    await page.click('[data-text="BREEZE"]');
    
    // Assert physics worker remains active without error fallback
    expect(await page.evaluate(() => window.__artzDebug.usingWorker)).toBe(true);

    // Wait for breeze cycle to complete within prompt time window
    await page.waitForFunction(() => !window.__artzDebug.snapshot(1).explosionActive, null, {
        timeout: 16_000
    });

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
});

test('animation locks preset selection and disables hover effect until finished', async ({ page }) => {
    await page.goto('/');
    await waitForRender(page);

    // Trigger Breeze preset
    await page.click('[data-text="BREEZE"]');

    // Confirm animation is active
    await page.waitForFunction(() => window.__artzDebug.snapshot(1).explosionActive === true);

    // Verify all preset buttons are disabled while animating
    const chipsDisabled = await page.evaluate(() => {
        const chips = Array.from(document.querySelectorAll('.preset-chip'));
        return chips.every(c => c.disabled && c.classList.contains('disabled'));
    });
    expect(chipsDisabled).toBe(true);

    // Move mouse over canvas and verify uMouse uniform is clamped / disabled (-1000)
    await page.mouse.move(500, 300);
    const uMouseDuringExplosion = await page.evaluate(() => {
        const v = window.__artzDebug._render().particles.material.uniforms.uMouse.value;
        return { x: v.x, y: v.y };
    });
    expect(uMouseDuringExplosion.x).toBe(-1000);
    expect(uMouseDuringExplosion.y).toBe(-1000);

    // Attempting to click another preset should not change the running style (remains Breeze = style 2)
    await page.click('[data-text="EXPLODE"]', { force: true });
    expect(await page.evaluate(() => window.__artzDebug.snapshot(1).randomized.style)).toBe(2);

    // Wait until animation completes
    await page.waitForFunction(() => !window.__artzDebug.snapshot(1).explosionActive, null, { timeout: 16_000 });

    // Verify preset buttons are re-enabled
    const chipsEnabled = await page.evaluate(() => {
        const chips = Array.from(document.querySelectorAll('.preset-chip'));
        return chips.every(c => !c.disabled && !c.classList.contains('disabled'));
    });
    expect(chipsEnabled).toBe(true);
});

