// Rebuild the particle sculpture from a text value (debounced input + morph).
export async function setText(page, value) {
    await page.locator('#text-input').fill(value);
    // inputDebounceMs (150) + font/rasterize/rebuild margin
    await page.waitForTimeout(400);
}

// Wait for the WebGL canvas to render at least one frame.
export async function waitForRender(page) {
    await page.waitForFunction(() => {
        const d = window.__artzDebug;
        return d && d.particleCount > 0 && !!d._render().particles;
    });
}

export const particleCount = (page) =>
    page.evaluate(() => window.__artzDebug.particleCount);

// Wait until the camera depth has settled on its target (e.g. after auto-fit or
// zoom), so frustum reads and pointer probes are not racing the zoom lerp.
export async function waitForCameraSettle(page) {
    await page.waitForFunction(() => {
        const r = window.__artzDebug._render();
        return r && r.camera && Math.abs(r.camera.position.z - r.targetZ) < 0.001;
    });
}

export const geometryCount = (page) =>
    page.evaluate(() => window.__artzDebug.geometryCount);

// Reads the first `n` position floats to confirm positions change over time.
export async function samplePositions(page, n = 24) {
    return page.evaluate((count) => {
        const geo = window.__artzDebug._render().particles.geometry;
        const arr = Array.from(geo.attributes.position.array.slice(0, count));
        return arr;
    }, n);
}
