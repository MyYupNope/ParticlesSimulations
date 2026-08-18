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
        const panel = document.getElementById('control-panel').getBoundingClientRect();
        const canvas = document.querySelector('canvas').getBoundingClientRect();
        const cam = window.__artzDebug._render().camera;
        return {
            stage: { left: stage.left, top: stage.top, width: stage.width, height: stage.height },
            panel: { left: panel.left, top: panel.top, right: panel.right, centerX: panel.left + panel.width / 2, width: panel.width },
            canvas: { left: canvas.left, top: canvas.top, width: canvas.width, height: canvas.height },
            cam: { left: cam.left, right: cam.right, aspect: cam.aspect }
        };
    });
}

test('desktop: menu docks left and sculpture centers in the remaining space', async ({ page }) => {
    const W = 1280, H = 720;
    await openPage(page, W, H);

    const info = await stageInfo(page);

    // Menu is a compact card on the left half.
    expect(info.panel.right).toBeLessThan(W / 2);
    expect(info.panel.top).toBeCloseTo(20, 0);
    expect(info.panel.left).toBeCloseTo(20, 0);

    // Stage (and canvas) start right of the menu (~360px) and fill the rest.
    expect(info.stage.left).toBeGreaterThan(300);
    expect(info.stage.left).toBeLessThan(400);
    expect(info.canvas.left).toBeGreaterThan(300);
    expect(info.stage.width).toBeCloseTo(W - info.stage.left, 0);

    // Auto-fit zoom keeps the whole message visible in the narrower stage.
    expect(info.cam.right).toBeGreaterThan(41);

    // Pointer at the stage center maps to the world origin.
    await page.mouse.move(info.stage.left + info.stage.width / 2, info.stage.top + info.stage.height / 2);
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

test('mobile: menu stays on top and stage covers the full viewport', async ({ page }) => {
    const W = 390, H = 844;
    await openPage(page, W, H);

    const info = await stageInfo(page);

    // Menu is top-centered.
    expect(info.panel.top).toBeLessThan(60);
    expect(Math.abs(info.panel.centerX - W / 2)).toBeLessThan(40);

    // Stage/canvas cover the full viewport (no reserved menu space).
    expect(info.stage.left).toBe(0);
    expect(info.stage.top).toBe(0);
    expect(info.stage.width).toBeCloseTo(W, 0);
    expect(info.canvas.left).toBe(0);
    expect(info.canvas.width).toBeCloseTo(W, 0);
});
