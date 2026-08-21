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
    await page.waitForFunction(() => window.__artzDebug.snapshot(1).explosionActive === false, null, { timeout: 15000 });
    await expect(dock).not.toHaveClass(/collapsed/);
    const lineAfter = await page.$eval('#context-line', el => el.textContent);
    expect(lineAfter).toContain('Type a message');
});

test('dbl-tap explosion surfaces the animation info and tucks the menu like a preset click', async ({ page }) => {
    await openPage(page, 1280, 720);

    const dock = page.locator('#dock');
    await expect(dock).not.toHaveClass(/collapsed/);

    // Double-click (the desktop "dbl-tap" analogue) on the stage sparks a random
    // preset and must follow the same menu procedure as an Animations chip click.
    await page.dblclick('#stage');
    await page.waitForFunction(() => window.__artzDebug.snapshot(1).explosionActive === true, null, { timeout: 3000 });
    await expect(dock).toHaveClass(/collapsed/);
    const line = await page.$eval('#context-line', el => el.textContent);
    expect(line.trim().length).toBeGreaterThan(0);
    expect(line).not.toContain('Type a message');

    await page.waitForFunction(() => window.__artzDebug.snapshot(1).explosionActive === false, null, { timeout: 15000 });
    await expect(dock).not.toHaveClass(/collapsed/);
    const lineAfter = await page.$eval('#context-line', el => el.textContent);
    expect(lineAfter).toContain('Type a message');
});
