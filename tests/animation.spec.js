import { test, expect } from '@playwright/test';
import { waitForRender, waitForCameraSettle, fitMetrics } from './helpers';

const EMOJI = encodeURIComponent('😀');

async function openPage(page, width, height, query = '/') {
    await page.setViewportSize({ width, height });
    await page.goto(query);
    await waitForRender(page);
    await page.waitForFunction(() => {
        const cam = window.__artzDebug._render().camera;
        return cam && Math.abs(cam.left) > 1;
    });
    await waitForCameraSettle(page);
}

test('desktop: choosing an animation closes the dock, updates the context line, then restores the dock', async ({ page }) => {
    await openPage(page, 1280, 720);

    const dock = page.locator('#dock');
    await expect(dock).not.toHaveClass(/collapsed/);

    await page.click('#dock .preset-chip[data-text="EXPLODE"]');

    // The options menu tucks away while the animation takes place.
    await expect(dock).toHaveClass(/collapsed/);

    // The context line announces which animation was selected.
    const line = await page.$eval('#context-line', el => el.textContent);
    expect(line.toLowerCase()).toContain('blast');

    // The animation is running while the menu is hidden.
    await page.waitForFunction(() => window.__artzDebug.snapshot(1).explosionActive === true, null, { timeout: 3000 });

    // Once the animation finishes, the menu comes back.
    await page.waitForFunction(() => window.__artzDebug.snapshot(1).explosionActive === false, null, { timeout: 15000 });
    await expect(dock).not.toHaveClass(/collapsed/);

    // The context line returns to its default hint after the animation.
    const lineAfter = await page.$eval('#context-line', el => el.textContent);
    expect(lineAfter.toLowerCase()).not.toContain('blast');
});

test('mobile: choosing an animation closes the drawer immediately and restores it after', async ({ page }) => {
    await openPage(page, 390, 844);

    const drawer = page.locator('#drawer');
    await page.click('#menu-toggle-btn');
    await expect(drawer).toHaveClass(/open/);

    await page.locator('#drawer .preset-chip[data-text="EXPLODE"]').click();

    // The drawer closes right away for the animation (not after the 1s timer).
    await expect(drawer).not.toHaveClass(/open/);

    await page.waitForFunction(() => window.__artzDebug.snapshot(1).explosionActive === true, null, { timeout: 3000 });
    await page.waitForFunction(() => window.__artzDebug.snapshot(1).explosionActive === false, null, { timeout: 15000 });

    // The menu comes back once the animation finishes.
    await expect(drawer).toHaveClass(/open/);
});

test('desktop: dock collapse/expand refits the sculpture within its margins', async ({ page }) => {
    await openPage(page, 1280, 720);

    const dock = page.locator('#dock');
    const before = await fitMetrics(page);

    // Collapse the dock: more vertical room, the sculpture grows to fill it
    // while still respecting the margins.
    await page.click('#dock-toggle-btn');
    await expect(dock).toHaveClass(/collapsed/);
    await page.waitForTimeout(500); // let the 0.4s max-height transition finish
    await waitForCameraSettle(page);
    const collapsed = await fitMetrics(page);
    expect(collapsed.availH).toBeGreaterThan(before.availH);
    expect(collapsed.boxHpx).toBeLessThanOrEqual(collapsed.availH + 1);
    expect(collapsed.boxWpx).toBeLessThanOrEqual(collapsed.availW + 1);

    // Expanding the dock restores the previous clearance and refits again.
    await page.click('#dock-toggle-btn');
    await expect(dock).not.toHaveClass(/collapsed/);
    await page.waitForTimeout(500); // let the 0.4s max-height transition finish
    await waitForCameraSettle(page);
    const expanded = await fitMetrics(page);
    expect(expanded.availH).toBeLessThan(collapsed.availH + 1);
    expect(expanded.boxHpx).toBeLessThanOrEqual(expanded.availH + 1);
    expect(expanded.boxWpx).toBeLessThanOrEqual(expanded.availW + 1);
});

test('emoji sculpture is maximized within the stage margins like text', async ({ page }) => {
    await openPage(page, 1280, 720);

    await page.click('#dock .message-option[data-message-mode="emoji"]');
    await page.click('#dock .emoji-chip[data-emoji="😀"]');
    await page.waitForFunction((e) => new URLSearchParams(window.location.search).get('t') === e, '😀');
    await waitForCameraSettle(page);

    const m = await fitMetrics(page);
    expect(m.boxWpx).toBeLessThanOrEqual(m.availW + 1);
    expect(m.boxHpx).toBeLessThanOrEqual(m.availH + 1);
    expect(Math.max(m.boxWpx / m.availW, m.boxHpx / m.availH)).toBeGreaterThan(0.9);
});

test('Space-triggered explosion surfaces the animation info and tucks the menu like a preset click', async ({ page }) => {
    await openPage(page, 1280, 720);

    const dock = page.locator('#dock');
    await expect(dock).not.toHaveClass(/collapsed/);

    // Default context is the Text-mode hint.
    const defaultLine = await page.$eval('#context-line', el => el.textContent);
    expect(defaultLine).toContain('Type a message');

    // Space sparks a random preset: the context line must show its description
    // and the menu must tuck away, exactly as when clicking an Animations chip.
    await page.keyboard.press('Space');
    await page.waitForFunction(() => window.__artzDebug.snapshot(1).explosionActive === true, null, { timeout: 3000 });
    await expect(dock).toHaveClass(/collapsed/);
    const line = await page.$eval('#context-line', el => el.textContent);
    expect(line.trim().length).toBeGreaterThan(0);
    expect(line).not.toContain('Type a message');

    // After the animation finishes the menu comes back and the hint returns.
    // (Random pool includes the ~16s TORUS preset, hence the generous wait.)
    await page.waitForFunction(() => window.__artzDebug.snapshot(1).explosionActive === false, null, { timeout: 22000 });
    await expect(dock).not.toHaveClass(/collapsed/);
    const lineAfter = await page.$eval('#context-line', el => el.textContent);
    expect(lineAfter).toContain('Type a message');
});

test('triple-tap explosion surfaces the animation info and tucks the menu like a preset click', async ({ page }) => {
    await openPage(page, 1280, 720);
    await page.waitForFunction(() => window.__artzReady === true);

    const dock = page.locator('#dock');
    await expect(dock).not.toHaveClass(/collapsed/);

    // Synthetic taps dispatched from a single page task: the pointerdown stream
    // is identical to a real gesture, but immune to CDP protocol stalls that
    // can stretch real click bursts past CONFIG.tapWindowMs under load.
    const tap = (count) => page.evaluate((n) => {
        const stage = document.getElementById('stage');
        const opts = {
            pointerType: 'mouse', pointerId: 1, isPrimary: true,
            clientX: 640, clientY: 200, bubbles: true
        };
        for (let i = 0; i < n; i++) {
            stage.dispatchEvent(new PointerEvent('pointerdown', opts));
            stage.dispatchEvent(new PointerEvent('pointerup', opts));
        }
    }, count);

    // Gesture separation: a double-tap must NOT explode (reserved for splashes).
    await tap(2);
    await page.waitForTimeout(1200); // out of the tap window; counter resets
    expect(await page.evaluate(() => window.__artzDebug.snapshot(1).explosionActive)).toBe(false);

    // Triple-tap (the desktop analogue of the mobile gesture) sparks a random
    // preset and must follow the same menu procedure as an Animations chip click.
    await tap(3);
    await page.waitForFunction(() => window.__artzDebug.snapshot(1).explosionActive === true, null, { timeout: 3000 });
    await expect(dock).toHaveClass(/collapsed/);
    const line = await page.$eval('#context-line', el => el.textContent);
    expect(line.trim().length).toBeGreaterThan(0);
    expect(line).not.toContain('Type a message');

    await page.waitForFunction(() => window.__artzDebug.snapshot(1).explosionActive === false, null, { timeout: 22000 });
    await expect(dock).not.toHaveClass(/collapsed/);
    const lineAfter = await page.$eval('#context-line', el => el.textContent);
    expect(lineAfter).toContain('Type a message');
});

test('pre-explosion taps ping a subtle ring indicator', async ({ page }) => {
    await openPage(page, 1280, 720);
    await page.waitForFunction(() => window.__artzReady === true);

    // Dispatch the taps AND observe the ring from the same page task: under
    // parallel software-GL load, protocol round-trips between separate
    // evaluates (measured 0.5-2.7s) outlast the ring's brief lifetime, so an
    // observer in a later evaluate can start after the ring already faded.
    // Sampling runs on the page's own clock (30ms interval) from the first
    // ping. Multi-pings dispatch synchronously (no timers to stall): the tap
    // counter increments per pointerdown within one task. The task resolves
    // only after the ring settled AND the tap window (800ms) expired, so
    // consecutive phases never feed the same multi-tap counter.
    const tapPhase = ({ pings, wantCount, wantExplosion }) => page.evaluate((cfg) => new Promise((resolve) => {
        const stage = document.getElementById('stage');
        const opts = {
            pointerType: 'mouse', pointerId: 1, isPrimary: true,
            clientX: 640, clientY: 200, bubbles: true
        };
        let sawActive = false;
        let maxCount = 0;
        let exploded = false;
        const lastPing = performance.now();
        for (let i = 0; i < cfg.pings; i++) {
            stage.dispatchEvent(new PointerEvent('pointerdown', opts));
            stage.dispatchEvent(new PointerEvent('pointerup', opts));
        }
        const t0 = performance.now();
        const deadline = t0 + 15000;
        const iv = setInterval(() => {
            const st = window.__artzDebug.tapRing;
            if (st.active) { sawActive = true; maxCount = Math.max(maxCount, st.count); }
            if (cfg.wantExplosion) {
                exploded = exploded || window.__artzDebug.snapshot(1).explosionActive;
            }
            const ringSeen = !cfg.wantCount || (sawActive && maxCount >= cfg.wantCount);
            const settled = !st.active && performance.now() - lastPing > 1200;
            if ((ringSeen && settled && (!cfg.wantExplosion || exploded)) || performance.now() > deadline) {
                clearInterval(iv);
                resolve({ sawActive, maxCount, exploded, active: st.active });
            }
        }, 30);
    }), { pings, wantCount, wantExplosion });

    // Single tap: pings the ring at count 1, fades on its own.
    const first = await tapPhase({ pings: 1, wantCount: 1 });
    expect(first.sawActive).toBe(true);
    expect(first.maxCount).toBe(1);
    expect(first.active).toBe(false);

    // Double tap: the second tap re-pings at count 2 (gesture progress marker).
    const second = await tapPhase({ pings: 2, wantCount: 2 });
    expect(second.sawActive).toBe(true);
    expect(second.maxCount).toBe(2);
    expect(second.active).toBe(false);

    // Triple tap: explodes; no ring survives into the animation.
    const third = await tapPhase({ pings: 3, wantCount: 0, wantExplosion: true });
    expect(third.exploded).toBe(true);
    expect(third.active).toBe(false);
});
