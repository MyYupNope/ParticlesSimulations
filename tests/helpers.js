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

// The uniform per-side margin the app reserves around the sculpture (mirrors
// CONFIG.fitMargin) so it never touches the options menu or screen edges.
export const FIT_MARGIN = 56;

// Measure the sculpture's on-screen footprint (from its world-space bounding box
// projected through the camera) and the available region left by the top bar,
// the bottom chrome (dock/input bar), and FIT_MARGIN on every side.
export async function fitMetrics(page) {
    return page.evaluate((margin) => {
        const stage = document.getElementById('stage').getBoundingClientRect();
        const topbar = document.getElementById('topbar').getBoundingClientRect();
        const dock = document.getElementById('dock');
        const inputBar = document.getElementById('input-bar');
        const r = window.__artzDebug._render();
        const cam = r.camera;
        const z = cam.position.z;
        const tanHalf = Math.tan(75 * Math.PI / 360);
        const pxPerUnit = stage.height / (2 * z * tanHalf);
        let bottom = 0;
        if (dock) {
            const dr = dock.getBoundingClientRect();
            if (dr.height > 0) bottom = dr.height;
        }
        if (bottom === 0 && inputBar) bottom = inputBar.getBoundingClientRect().height;
        const home = r.particles.geometry.attributes.homePosition.array;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let i = 0; i < home.length; i += 3) {
            if (home[i] < minX) minX = home[i];
            if (home[i] > maxX) maxX = home[i];
            if (home[i + 1] < minY) minY = home[i + 1];
            if (home[i + 1] > maxY) maxY = home[i + 1];
        }
        return {
            stageW: stage.width,
            stageH: stage.height,
            topbarH: topbar.height,
            bottom,
            z,
            boxWpx: (maxX - minX) * pxPerUnit,
            boxHpx: (maxY - minY) * pxPerUnit,
            availW: stage.width - 2 * margin,
            availH: stage.height - (topbar.height + margin) - (bottom + margin)
        };
    }, FIT_MARGIN);
}
