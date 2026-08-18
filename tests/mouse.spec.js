import { test, expect } from '@playwright/test';
import { waitForRender, waitForCameraSettle } from './helpers';

const WIDTH = 1280;
const HEIGHT = 720;

// Move the pointer and wait until the mouse uniform converges on the world point
// implied by the orthographic frustum (world = NDC * frustum extent). This asserts
// the screen-to-world conversion directly, independent of physics frame timing.
async function probeMouse(page, x, y) {
    await page.mouse.move(x, y);
    await page.waitForFunction(([sx, sy]) => {
        const render = window.__artzDebug._render();
        const cam = render.camera;
        const u = render.particles.material.uniforms.uMouse.value;
        const rect = render.renderer.domElement.getBoundingClientRect();
        const nx = ((sx - rect.left) / rect.width) * 2 - 1;
        const ny = -((sy - rect.top) / rect.height) * 2 + 1;
        return Math.abs(u.x - nx * cam.right) < 0.01 &&
               Math.abs(u.y - ny * cam.top) < 0.01;
    }, [x, y]);
    const result = await page.evaluate(([sx, sy]) => {
        const render = window.__artzDebug._render();
        const cam = render.camera;
        const u = render.particles.material.uniforms.uMouse.value;
        const rect = render.renderer.domElement.getBoundingClientRect();
        const nx = ((sx - rect.left) / rect.width) * 2 - 1;
        const ny = -((sy - rect.top) / rect.height) * 2 + 1;
        return {
            got: { x: u.x, y: u.y },
            expected: { x: nx * cam.right, y: ny * cam.top }
        };
    }, [x, y]);
    expect(result.got.x).toBeCloseTo(result.expected.x, 1);
    expect(result.got.y).toBeCloseTo(result.expected.y, 1);
    return result.got;
}

async function openPage(page, query) {
    await page.setViewportSize({ width: WIDTH, height: HEIGHT });
    await page.goto(query);
    await waitForRender(page);
    // Wait until the per-frame frustum recalculation has replaced the placeholder
    // -1 bounds, and the auto-fit zoom has settled, so frustum reads are stable.
    await page.waitForFunction(() => {
        const cam = window.__artzDebug._render().camera;
        return cam && Math.abs(cam.left) > 1;
    });
    await waitForCameraSettle(page);
}

// The sculpture is centered in the stage (the space right of the left menu), not
// the viewport. Return the stage center in CSS pixel coordinates.
async function stageCenter(page) {
    return page.evaluate(() => {
        const r = document.getElementById('stage').getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
}

test('mouse world mapping spans the full stage under the orthographic camera', async ({ page }) => {
    await openPage(page, '/?t=Rodrigo%20rocks!');

    const c = await stageCenter(page);
    const center = await probeMouse(page, c.x, c.y);
    const left = await probeMouse(page, 8, HEIGHT / 2);
    const right = await probeMouse(page, WIDTH - 8, HEIGHT / 2);
    const top = await probeMouse(page, c.x, 8);
    const bottom = await probeMouse(page, c.x, HEIGHT - 8);

    // The sculpture centers on the stage (which excludes the left menu).
    expect(Math.abs(center.x)).toBeLessThan(0.01);
    expect(Math.abs(center.y)).toBeLessThan(0.01);
    // 'Rodrigo rocks!' is laid out ~80 world units wide, so the frustum edges must
    // sit well beyond the text half-width for the outer glyphs to be reachable.
    expect(Math.abs(left.x)).toBeGreaterThan(41);
    expect(Math.abs(right.x)).toBeGreaterThan(41);
    expect(Math.abs(top.y)).toBeGreaterThan(20);
    expect(Math.abs(bottom.y)).toBeGreaterThan(20);
    // Left/right edges land on opposite sides (not the compressed center rectangle).
    expect(left.x).toBeLessThan(-41);
    expect(right.x).toBeGreaterThan(41);
});
