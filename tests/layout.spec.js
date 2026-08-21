import { test, expect } from '@playwright/test';
import { waitForRender, waitForCameraSettle } from './helpers';

async function openPage(page, width, height, query = '/') {
    await page.setViewportSize({ width, height });
    await page.goto(query);
    await waitForRender(page);
    // Wait until the per-frame frustum recalculation has replaced the placeholder -1 bounds.
    await page.waitForFunction(() => {
        const cam = window.__artzDebug._render().camera;
        return cam && Math.abs(cam.left) > 1;
    });
    await waitForCameraSettle(page);
}

async function stageInfo(page) {
    return page.evaluate(() => {
        const stage = document.getElementById('stage').getBoundingClientRect();
        const canvas = document.querySelector('canvas').getBoundingClientRect();
        const cam = window.__artzDebug._render().camera;
        return {
            stage: { left: stage.left, top: stage.top, width: stage.width, height: stage.height },
            canvas: { left: canvas.left, top: canvas.top, width: canvas.width, height: canvas.height },
            cam: { left: cam.left, right: cam.right, aspect: cam.aspect }
        };
    });
}

test('desktop: full-viewport stage with bottom dock, collapse toggle, and dismissible hint', async ({ page }) => {
    const W = 1280, H = 720;
    await openPage(page, W, H);

    const info = await stageInfo(page);

    // Hamburger button is hidden on desktop.
    expect(await page.locator('#menu-toggle-btn').isVisible()).toBe(false);

    // Stage and canvas cover the full viewport (no reserved menu space).
    expect(info.stage.left).toBe(0);
    expect(info.stage.top).toBe(0);
    expect(info.stage.width).toBeCloseTo(W, 0);
    expect(info.stage.height).toBeCloseTo(H, 0);
    expect(info.canvas.left).toBe(0);
    expect(info.canvas.width).toBeCloseTo(W, 0);

    // Auto-fit zoom keeps the whole message visible.
    expect(info.cam.right).toBeGreaterThan(41);

    // Bottom dock is visible, horizontally centered, and hugging the bottom.
    const dock = page.locator('#dock');
    await expect(dock).toBeVisible();
    const dockBox = await dock.boundingBox();
    expect(dockBox.x).toBeGreaterThan(W / 2 - dockBox.width / 2 - 5);
    expect(dockBox.x).toBeLessThan(W / 2 - dockBox.width / 2 + 5);
    expect(dockBox.y + dockBox.height).toBeLessThanOrEqual(H - 5);

    // Dock collapse toggle hides the control body and flips back.
    await page.click('#dock-toggle-btn');
    await expect(dock).toHaveClass(/collapsed/);
    await page.click('#dock-toggle-btn');
    await expect(dock).not.toHaveClass(/collapsed/);

    // First-visit hint is visible and dismisses.
    const hint = page.locator('#hint');
    await expect(hint).toBeVisible();
    await page.click('#hint-dismiss');
    await expect(hint).toHaveClass(/dismissed/);

    // Pointer at the stage center maps to the world origin.
    await page.mouse.move(W / 2, H / 2);
    const u = await page.waitForFunction(() => {
        const v = window.__artzDebug._render().particles.material.uniforms.uMouse.value;
        return Math.abs(v.x) < 0.01 && Math.abs(v.y) < 0.01;
    }).then(() => page.evaluate(() => {
        const v = window.__artzDebug._render().particles.material.uniforms.uMouse.value;
        return { x: v.x, y: v.y };
    }));
    expect(Math.abs(u.x)).toBeLessThan(0.01);
    expect(Math.abs(u.y)).toBeLessThan(0.01);
});

test('mobile: hamburger drawer with 1s auto-close after selection and always-visible input bar', async ({ page }) => {
    const W = 390, H = 844;
    await openPage(page, W, H);

    const info = await stageInfo(page);

    // Stage/canvas cover the full viewport.
    expect(info.stage.left).toBe(0);
    expect(info.stage.top).toBe(0);
    expect(info.stage.width).toBeCloseTo(W, 0);
    expect(info.canvas.left).toBe(0);
    expect(info.canvas.width).toBeCloseTo(W, 0);

    // Hamburger button is visible on mobile.
    const toggleBtn = page.locator('#menu-toggle-btn');
    await expect(toggleBtn).toBeVisible();
    expect(await toggleBtn.getAttribute('aria-expanded')).toBe('false');

    // Always-visible message input bar at the bottom.
    await expect(page.locator('#input-bar')).toBeVisible();
    await expect(page.locator('#mobile-text-input')).toBeVisible();

    // Drawer is closed / off-screen initially.
    const drawer = page.locator('#drawer');
    expect(await drawer.evaluate(el => el.classList.contains('open'))).toBe(false);

    // Open the drawer via the hamburger.
    await toggleBtn.click();
    await expect(drawer).toHaveClass(/open/);
    expect(await toggleBtn.getAttribute('aria-expanded')).toBe('true');
    await expect(page.locator('#drawer-backdrop')).toHaveClass(/active/);

    // Selecting a preset auto-closes the drawer after ~1s.
    await drawer.locator('.preset-chip[data-text="BREEZE"]').click();
    await expect(drawer).not.toHaveClass(/open/, { timeout: 2500 });

    // Open again and close via Escape key.
    await toggleBtn.click();
    await expect(drawer).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    expect(await drawer.evaluate(el => el.classList.contains('open'))).toBe(false);

    // Open again and close by clicking the backdrop.
    await toggleBtn.click();
    await expect(drawer).toHaveClass(/open/);
    await page.locator('#drawer-backdrop').click({ position: { x: 350, y: 400 } });
    expect(await drawer.evaluate(el => el.classList.contains('open'))).toBe(false);
});
