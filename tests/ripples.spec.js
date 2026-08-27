import { test, expect } from '@playwright/test';
import { waitForRender, waitForCameraSettle } from './helpers';

const WIDTH = 1280;
const HEIGHT = 720;

async function openPage(page, query) {
    await page.setViewportSize({ width: WIDTH, height: HEIGHT });
    await page.goto(query);
    await waitForRender(page);
    await page.waitForFunction(() => {
        const cam = window.__artzDebug._render().camera;
        return cam && Math.abs(cam.left) > 1;
    });
    await waitForCameraSettle(page);
}

async function stageCenter(page) {
    return page.evaluate(() => {
        const r = document.getElementById('stage').getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
}

// Strongest active wavefront amplitude across the 8 ripple slots.
async function maxRippleAmp(page) {
    return page.evaluate(() => {
        const r = window.__artzDebug.ripples;
        let maxAmp = 0;
        for (let i = 3; i < r.length; i += 4) maxAmp = Math.max(maxAmp, r[i]);
        return maxAmp;
    });
}

// Peak |pos - home| across the ENTIRE sculpture (raster order puts the first
// few hundred particles at one edge, which a 30u wavefront may never reach).
async function maxDisplacement(page) {
    return page.evaluate(() => {
        const geo = window.__artzDebug._render().particles.geometry;
        const pos = geo.attributes.position.array;
        const home = geo.attributes.homePosition.array;
        let maxD = 0;
        for (let i = 0; i < pos.length; i += 3) {
            const dx = pos[i] - home[i];
            const dy = pos[i + 1] - home[i + 1];
            const dz = pos[i + 2] - home[i + 2];
            const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (d > maxD) maxD = d;
        }
        return maxD;
    });
}

test('fast pointer sweeps emit skipping-stone ripples', async ({ page }) => {
    await openPage(page, '/?t=Ripples');

    const c = await stageCenter(page);
    // Wide deltas per dispatched event keep the screen-space speed reading
    // far above the emission threshold even under low software-render FPS.
    await page.mouse.move(c.x - 300, c.y);
    await page.mouse.move(c.x + 300, c.y, { steps: 2 });

    await expect.poll(
        () => page.evaluate(() => window.__artzDebug.rippleCount),
        { timeout: 5000 }
    ).toBeGreaterThanOrEqual(1);
});

test('ripple wavefronts displace particles and the sculpture settles back home', async ({ page }) => {
    await openPage(page, '/?t=Ripples');

    const before = await maxDisplacement(page);
    expect(before).toBeLessThan(0.5);

    // Deterministic strong wavefront from the sculpture center (local space):
    // amp 3.0 targets a 6.6u radial push, fps-independent via kFrame scaling.
    await page.evaluate(() => window.__artzDebug.emitTestRipple(0, 0, 3.0));

    // A wavefront crossing the sculpture pushes particles well past the
    // raster jitter noise floor.
    await expect.poll(() => maxDisplacement(page), { timeout: 8000 })
        .toBeGreaterThan(1.0);

    // Wavefronts expire (2.2s lifetime) and the springs relax back home. The
    // ring can drift past the sculpture edge before its slot clears, so poll
    // the expiry rather than asserting it alongside the settle check.
    await expect.poll(() => maxDisplacement(page), { timeout: 10000 })
        .toBeLessThan(0.5);
    await expect.poll(
        () => page.evaluate(() => window.__artzDebug.rippleCount),
        { timeout: 10000 }
    ).toBe(0);
});

test('press-and-hold throws a bigger rock than a quick tap', async ({ page }) => {
    await openPage(page, '/?t=Ripples');
    const c = await stageCenter(page);

    // Press-hold-release dispatched in-page with a fixed hold time: protocol
    // latency between separate mouse.down()/up() calls (measured ~500ms under
    // parallel load) would inflate a quick tap's measured hold past the 150ms
    // grace and blur the pebble/rock distinction. The task samples the ripple
    // slots on the page clock until the splash registers.
    const splashAmp = (x, y, holdMs) => page.evaluate(({ px, py, hold }) => new Promise((resolve) => {
        const stage = document.getElementById('stage');
        const opts = {
            pointerType: 'mouse', pointerId: 1, isPrimary: true,
            clientX: px, clientY: py, bubbles: true
        };
        stage.dispatchEvent(new PointerEvent('pointerdown', opts));
        setTimeout(() => {
            stage.dispatchEvent(new PointerEvent('pointerup', opts));
            const t0 = performance.now();
            const iv = setInterval(() => {
                const r = window.__artzDebug.ripples;
                let maxAmp = 0;
                for (let i = 3; i < r.length; i += 4) maxAmp = Math.max(maxAmp, r[i]);
                if (maxAmp > 0 || performance.now() - t0 > 6000) {
                    clearInterval(iv);
                    resolve(maxAmp);
                }
            }, 30);
        }, hold);
    }), { px: x, py: y, hold: holdMs });

    // Quick tap (60ms hold) -> pebble (charge 0, amp 0.8).
    const tapAmp = await splashAmp(c.x - 120, c.y, 60);
    expect(tapAmp).toBeGreaterThan(0.5);
    expect(tapAmp).toBeLessThan(1.5);

    // Let the pebble expire so slot reuse cannot pollute the next reading.
    await expect.poll(
        () => page.evaluate(() => window.__artzDebug.rippleCount),
        { timeout: 10000 }
    ).toBe(0);

    // Hold 700ms -> charged rock (amp = 0.8 + 3.2 * 0.55 = ~2.56).
    const rockAmp = await splashAmp(c.x + 120, c.y, 700);
    expect(rockAmp).toBeGreaterThan(2.0);
    expect(rockAmp).toBeLessThan(4.5);
});

test('moving a held pointer turns the charge into a drag, not a splash', async ({ page }) => {
    await openPage(page, '/?t=Ripples');
    const c = await stageCenter(page);

    await page.mouse.move(c.x - 120, c.y);
    await page.mouse.down();
    await page.mouse.move(c.x + 120, c.y, { steps: 6 });
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.__artzDebug.charge.active)).toBe(false);
    await page.mouse.up();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.__artzDebug.rippleCount)).toBe(0);
});

test('bigger splashes spread faster, reach farther, and last longer', async ({ page }) => {
    await openPage(page, '/?t=Ripples');

    // Profile determinism: intensity-driven dynamics straight from the kernel.
    const profiles = await page.evaluate(() => ({
        pebble: window.__artzDebug.rippleProfile(0.8),
        boulder: window.__artzDebug.rippleProfile(4.0)
    }));
    expect(profiles.pebble.speed).toBeCloseTo(11.0, 1);
    expect(profiles.boulder.speed).toBeCloseTo(19.0, 1);
    expect(profiles.boulder.maxRadius).toBeGreaterThan(profiles.pebble.maxRadius * 2);
    expect(profiles.boulder.decay).toBeLessThan(profiles.pebble.decay);

    // Behavioral: sample the displacement envelope until the sculpture settles.
    const envelope = async () => {
        const t0 = Date.now();
        let peak = 0;
        while (Date.now() - t0 < 12000) {
            const d = await maxDisplacement(page);
            if (d > peak) peak = d;
            if (d < 0.3 && Date.now() - t0 > 500) break;
            await page.waitForTimeout(120);
        }
        return { peak, duration: Date.now() - t0 };
    };

    await page.evaluate(() => window.__artzDebug.emitTestRipple(0, 0, 0.8));
    const pebbleEnv = await envelope();

    // Let the pebble slot fully expire so slot reuse cannot pollute the boulder.
    await expect.poll(
        () => page.evaluate(() => window.__artzDebug.rippleCount),
        { timeout: 8000 }
    ).toBe(0);

    await page.evaluate(() => window.__artzDebug.emitTestRipple(0, 0, 4.0));
    const boulderEnv = await envelope();

    // The boulder pushes much harder and its ring keeps traveling visibly
    // longer (faster spread + more distant reach + slower fade).
    expect(boulderEnv.peak).toBeGreaterThan(pebbleEnv.peak * 1.5);
    expect(boulderEnv.duration).toBeGreaterThan(pebbleEnv.duration * 1.25);
});

test('ripples stay disabled while an animation runs', async ({ page }) => {
    await openPage(page, '/?t=Ripples');

    // Trigger Breeze preset (mirrors patterns.spec.js) and confirm it is active.
    await page.click('[data-text="BREEZE"]');
    await page.waitForFunction(() => window.__artzDebug.snapshot(1).explosionActive === true);

    const c = await stageCenter(page);
    await page.mouse.move(c.x - 220, c.y);
    await page.mouse.move(c.x + 220, c.y, { steps: 10 });
    await page.waitForTimeout(300);

    expect(await page.evaluate(() => window.__artzDebug.rippleCount)).toBe(0);

    // Existing hover-lock contract: uMouse stays parked during animations.
    const u = await page.evaluate(() => {
        const v = window.__artzDebug._render().particles.material.uniforms.uMouse.value;
        return { x: v.x, y: v.y };
    });
    expect(u.x).toBe(-1000);
    expect(u.y).toBe(-1000);
});
