import { test, expect } from '@playwright/test';
import { waitForRender, waitForCameraSettle } from './helpers';
import { deflateSync } from 'node:zlib';

// Build a tiny valid RGBA PNG (2x2, two white pixels top, two red pixels bottom)
// so the upload path is exercised against real rasterized content.
function makePng(width, height) {
    const crcTable = new Int32Array(256).map((_, n) => {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        return c;
    });
    const crc32 = (buf) => {
        let c = -1;
        for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
        return (c ^ -1) >>> 0;
    };
    const chunk = (type, data) => {
        const len = Buffer.alloc(4);
        len.writeUInt32BE(data.length);
        const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
        const crc = Buffer.alloc(4);
        crc.writeUInt32BE(crc32(body));
        return Buffer.concat([len, body, crc]);
    };

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;  // bit depth
    ihdr[9] = 6;  // RGBA
    ihdr[10] = 0; // no compression filter
    ihdr[11] = 0;
    ihdr[12] = 0;

    const raw = Buffer.alloc(height * (1 + width * 4));
    for (let y = 0; y < height; y++) {
        const row = y * (1 + width * 4);
        raw[row] = 0;
        for (let x = 0; x < width; x++) {
            const p = row + 1 + x * 4;
            const isBottom = y >= height / 2;
            raw[p] = isBottom ? 255 : 255;
            raw[p + 1] = isBottom ? 0 : 255;
            raw[p + 2] = isBottom ? 0 : 255;
            raw[p + 3] = 255;
        }
    }

    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', ihdr),
        chunk('IDAT', deflateSync(raw)),
        chunk('IEND', Buffer.alloc(0))
    ]);
}

async function openPage(page, query = '/') {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(query);
    await waitForRender(page);
    await page.waitForFunction(() => {
        const cam = window.__artzDebug._render().camera;
        return cam && Math.abs(cam.left) > 1;
    });
}

test('Message offers Text, Emoji and Image types with contextual follow-ups', async ({ page }) => {
    await openPage(page);

    const tabs = await page.$$eval('#dock .message-option', els => els.map(e => e.getAttribute('data-message-mode')));
    expect(tabs).toEqual(['text', 'emoji', 'image']);

    // Text is the default type: its text area is visible; emoji roster and image
    // upload stay hidden until their type is selected.
    expect(await page.$eval('#dock .message-option.active', el => el.getAttribute('data-message-mode'))).toBe('text');
    await expect(page.locator('#text-input')).toBeVisible();
    await expect(page.locator('#dock .emoji-row')).toBeHidden();
    await expect(page.locator('#dock .image-message-mode')).toBeHidden();

    // Emoji type reveals the roster of pre-selected emojis.
    await page.click('#dock .message-option[data-message-mode="emoji"]');
    expect(await page.$eval('#dock .message-option.active', el => el.getAttribute('data-message-mode'))).toBe('emoji');
    await expect(page.locator('#dock .emoji-row')).toBeVisible();
    await expect(page.locator('#text-input')).toBeHidden();

    // Image type hides the text area/emojis and reveals the upload.
    await page.click('#dock .message-option[data-message-mode="image"]');
    expect(await page.$eval('#dock .message-option.active', el => el.getAttribute('data-message-mode'))).toBe('image');
    await expect(page.locator('#text-input')).toBeHidden();
    await expect(page.locator('#dock .image-upload-button')).toBeVisible();
    await expect(page.locator('#dock .image-name')).toHaveText('No file chosen');
    const uploadButton = await page.locator('#dock .image-upload-button').boundingBox();
    const imageName = await page.locator('#dock .image-name').boundingBox();
    expect(imageName.x).toBeGreaterThan(uploadButton.x + uploadButton.width);
    const buttonCenterY = uploadButton.y + uploadButton.height / 2;
    const nameCenterY = imageName.y + imageName.height / 2;
    expect(Math.abs(nameCenterY - buttonCenterY)).toBeLessThan(4);

    // And back to Text.
    await page.click('#dock .message-option[data-message-mode="text"]');
    await expect(page.locator('#text-input')).toBeVisible();
    await expect(page.locator('#dock .image-message-mode')).toBeHidden();
});

test('uploading an image turns it into a source-colored particle sculpture', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));

    await openPage(page);
    await page.click('#dock .message-option[data-message-mode="image"]');

    await page.locator('#image-input').setInputFiles({
        name: 'half-red.png',
        mimeType: 'image/png',
        buffer: makePng(2, 2)
    });

    // The rebuild rasterizes the image (hundreds of particles, not text density).
    await page.waitForFunction(() => document.querySelector('#dock .image-name')?.textContent === 'half-red.png');
    await page.waitForFunction(() => window.__artzDebug._render().particles.material.uniforms.uEmojiMode.value === 1);
    const result = await page.evaluate(() => {
        const render = window.__artzDebug._render();
        const geo = render.particles.geometry;
        const colors = geo.attributes.sourceColor.array;
        let red = 0, white = 0;
        for (let i = 0; i < colors.length; i += 4) {
            if (colors[i] > 200 && colors[i + 1] < 90 && colors[i + 2] < 90) red++;
            if (colors[i] > 200 && colors[i + 1] > 200 && colors[i + 2] > 200) white++;
        }
        return {
            count: window.__artzDebug.particleCount,
            emojiMode: render.particles.material.uniforms.uEmojiMode.value,
            red,
            white,
            mode: document.querySelector('#dock .message-option.active').getAttribute('data-message-mode'),
            imageName: document.querySelector('#dock .image-name').textContent
        };
    });

    // Source-color rendering with both halves of the test image present.
    expect(result.emojiMode).toBe(1);
    expect(result.red).toBeGreaterThan(0);
    expect(result.white).toBeGreaterThan(0);
    expect(result.count).toBeGreaterThan(0);
    expect(result.mode).toBe('image');
    expect(result.imageName).toContain('half-red.png');
    expect(errors).toEqual([]);
});

async function uploadSquare(page) {
    await page.click('#dock .message-option[data-message-mode="image"]');
    await page.locator('#image-input').setInputFiles({
        name: 'square.png',
        mimeType: 'image/png',
        buffer: makePng(64, 64)
    });
    await page.waitForFunction(() => window.__artzDebug.particleCount > 0);
    await waitForCameraSettle(page);
}

// Mirrors CONFIG.imageFitPadX/Y and imageAutoZoom so the clearance floor is
// asserted without importing application constants.
function imageFrameMetrics(stageW, stageH, z) {
    const tanHalf = Math.tan(75 * Math.PI / 360);
    const side = stageH * 80 / (2 * z * tanHalf);
    return {
        side,
        leftGap: (stageW - side) / 2,
        bottomGap: (stageH - side) / 2
    };
}

test('uploaded image zooms out to clear the menu and bottom instructions', async ({ page }) => {
    await openPage(page);
    await uploadSquare(page);

    const m = await page.evaluate(() => {
        const stage = document.getElementById('stage').getBoundingClientRect();
        const cam = window.__artzDebug._render().camera;
        const r = window.__artzDebug._render();
        const tanHalf = Math.tan(75 * Math.PI / 360);
        const halfBox = 40;
        const padX = Math.min(120, stage.width * 0.35);
        const padY = Math.min(120, stage.height * 0.35);
        const dock = document.getElementById('dock');
        const dockH = dock ? dock.getBoundingClientRect().height : 0;
        const zByHeight = halfBox * stage.height / (tanHalf * Math.max(stage.height - 2 * padY - dockH, 1));
        const zByWidth = halfBox * stage.height / (tanHalf * Math.max(stage.width - 2 * padX, 1));
        return {
            z: cam.position.z,
            targetZ: r.targetZ,
            expectedZ: Math.min(120, Math.max(zByHeight, zByWidth, 10)),
            stageWidth: stage.width,
            stageHeight: stage.height,
            dockH
        };
    });

    // The camera should sit exactly where the padded fit demands, and farther out
    // than the previous image framing (~60.6 at this viewport) so the image reads
    // noticeably smaller.
    expect(Math.abs(m.z - m.expectedZ)).toBeLessThan(1.5);
    expect(m.z).toBeGreaterThan(61);
    expect(Math.abs(m.targetZ - m.z)).toBeLessThan(0.01);

    const fit = imageFrameMetrics(m.stageWidth, m.stageHeight, m.z);
    expect(fit.leftGap).toBeGreaterThanOrEqual(110);
    expect(fit.bottomGap).toBeGreaterThanOrEqual(110);
});

test('uploaded image keeps both clearances when width is the binding stage axis', async ({ page }) => {
    // Narrow-but-desktop window: the stage is portrait-ish (height < width ratio),
    // so the width constraint is the binding one in imageAutoZoom.
    await page.setViewportSize({ width: 1000, height: 800 });
    await page.goto('/');
    await waitForRender(page);
    await uploadSquare(page);

    const m = await page.evaluate(() => {
        const stage = document.getElementById('stage').getBoundingClientRect();
        const cam = window.__artzDebug._render().camera;
        const geo = window.__artzDebug._render().particles.geometry;
        const pos = geo.attributes.position.array;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let i = 0; i < pos.length; i += 3) {
            minX = Math.min(minX, pos[i]);
            maxX = Math.max(maxX, pos[i]);
            minY = Math.min(minY, pos[i + 1]);
            maxY = Math.max(maxY, pos[i + 1]);
        }
        const tanHalf = Math.tan(75 * Math.PI / 360);
        const side = stage.height * 80 / (2 * cam.position.z * tanHalf);
        return {
            z: cam.position.z,
            stageWidth: stage.width,
            stageHeight: stage.height,
            side,
            leftGap: (stage.width - side) / 2,
            bottomGap: (stage.height - side) / 2,
            aspect: (maxX - minX) / (maxY - minY)
        };
    });

    // The width-binding fit must still honor both paddings, keep a square source
    // square, and never push the image past the stage's horizontal edges.
    expect(m.leftGap).toBeGreaterThanOrEqual(110);
    expect(m.bottomGap).toBeGreaterThanOrEqual(110);
    expect(Math.abs(m.aspect - 1)).toBeLessThan(0.15);
    expect(m.side).toBeLessThanOrEqual(m.stageWidth);
});
