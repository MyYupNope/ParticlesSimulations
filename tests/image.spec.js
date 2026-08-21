import { test, expect } from '@playwright/test';
import { waitForRender, waitForCameraSettle, fitMetrics } from './helpers';
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

    // The context line reflects the active message type (Text default).
    await expect(page.locator('#context-line')).toContainText('Type a message');

    // Emoji type reveals the roster of pre-selected emojis and its own context.
    await page.click('#dock .message-option[data-message-mode="emoji"]');
    expect(await page.$eval('#dock .message-option.active', el => el.getAttribute('data-message-mode'))).toBe('emoji');
    await expect(page.locator('#dock .emoji-row')).toBeVisible();
    await expect(page.locator('#text-input')).toBeHidden();
    await expect(page.locator('#context-line')).toContainText('Pick an emoji');

    const emojiLayout = await page.evaluate(() => {
        const panel = document.querySelector('#dock .emoji-message-mode').getBoundingClientRect();
        const row = document.querySelector('#dock .emoji-row');
        const rowBox = row.getBoundingClientRect();
        const chips = Array.from(row.querySelectorAll('.emoji-chip')).map(chip => {
            const box = chip.getBoundingClientRect();
            return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
        });
        return {
            panel,
            rowBox,
            scrollWidth: row.scrollWidth,
            clientWidth: row.clientWidth,
            chips
        };
    });
    expect(emojiLayout.scrollWidth).toBeLessThanOrEqual(emojiLayout.clientWidth + 1);
    expect(emojiLayout.rowBox.left).toBeGreaterThanOrEqual(emojiLayout.panel.left);
    expect(emojiLayout.rowBox.right).toBeLessThanOrEqual(emojiLayout.panel.right + 1);
    for (const chip of emojiLayout.chips) {
        expect(chip.left).toBeGreaterThanOrEqual(emojiLayout.rowBox.left);
        expect(chip.right).toBeLessThanOrEqual(emojiLayout.rowBox.right + 1);
    }

    // Image type hides the text area/emojis and reveals the upload, with its own context.
    await page.click('#dock .message-option[data-message-mode="image"]');
    expect(await page.$eval('#dock .message-option.active', el => el.getAttribute('data-message-mode'))).toBe('image');
    await expect(page.locator('#text-input')).toBeHidden();
    await expect(page.locator('#dock .image-upload-button')).toBeVisible();
    await expect(page.locator('#dock .image-name')).toHaveText('No file chosen');
    await expect(page.locator('#context-line')).toContainText('Upload an image');
    const uploadButton = await page.locator('#dock .image-upload-button').boundingBox();
    const imageName = await page.locator('#dock .image-name').boundingBox();
    expect(imageName.x).toBeGreaterThan(uploadButton.x + uploadButton.width);
    const buttonCenterY = uploadButton.y + uploadButton.height / 2;
    const nameCenterY = imageName.y + imageName.height / 2;
    expect(Math.abs(nameCenterY - buttonCenterY)).toBeLessThan(4);

    // And back to Text (with the Text context hint restored).
    await page.click('#dock .message-option[data-message-mode="text"]');
    await expect(page.locator('#text-input')).toBeVisible();
    await expect(page.locator('#dock .image-message-mode')).toBeHidden();
    await expect(page.locator('#context-line')).toContainText('Type a message');
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

test('entering Image with no prior upload renders nothing', async ({ page }) => {
    await openPage(page);

    await page.click('#dock .message-option[data-message-mode="image"]');
    await waitForCameraSettle(page);

    expect(await page.evaluate(() => window.__artzDebug.particleCount)).toBe(0);
    await expect(page.locator('#dock .image-name')).toHaveText('No file chosen');
});

test('returning to Image re-renders the last uploaded image', async ({ page }) => {
    await openPage(page);

    await uploadSquare(page);

    // Leave Image (Text) and return: the last uploaded image comes back.
    await page.click('#dock .message-option[data-message-mode="text"]');
    await waitForCameraSettle(page);
    expect(await page.inputValue('#text-input')).toBe('Bring your message!');

    await page.click('#dock .message-option[data-message-mode="image"]');
    await waitForCameraSettle(page);

    expect(await page.evaluate(() => window.__artzDebug._render().particles.material.uniforms.uEmojiMode.value)).toBe(1);
    await expect(page.locator('#dock .image-name')).toHaveText('square.png');
    expect(await page.evaluate(() => window.__artzDebug.particleCount)).toBeGreaterThan(0);
});

test('returning to Image after visiting Emoji restores the last uploaded image', async ({ page }) => {
    await openPage(page);

    await uploadSquare(page);

    // Visit Emoji (no pick) then return to Image: the uploaded image is remembered.
    await page.click('#dock .message-option[data-message-mode="emoji"]');
    await waitForCameraSettle(page);
    expect(await page.evaluate(() => window.__artzDebug.particleCount)).toBe(0);

    await page.click('#dock .message-option[data-message-mode="image"]');
    await waitForCameraSettle(page);

    expect(await page.evaluate(() => window.__artzDebug._render().particles.material.uniforms.uEmojiMode.value)).toBe(1);
    await expect(page.locator('#dock .image-name')).toHaveText('square.png');
    expect(await page.evaluate(() => window.__artzDebug.particleCount)).toBeGreaterThan(0);
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

test('returning to Text after an image upload restores the last typed text', async ({ page }) => {
    await openPage(page);

    await page.locator('#text-input').fill('Hello world');
    await page.waitForTimeout(400);
    await uploadSquare(page);

    await page.click('#dock .message-option[data-message-mode="text"]');
    await page.waitForFunction(() => new URLSearchParams(window.location.search).get('t') === 'Hello world');
    await waitForCameraSettle(page);

    expect(await page.inputValue('#text-input')).toBe('Hello world');
    expect(await page.$eval('#dock .message-option.active', el => el.getAttribute('data-message-mode'))).toBe('text');
    // Image is dropped: no image remains active in the sculpture.
    expect(await page.evaluate(() => window.__artzDebug._render().particles.material.uniforms.uEmojiMode.value)).toBe(0);
});

// Mirrors the app's unified max-fit so the clearance floor is asserted without
// importing application constants: the sculpture must stay inside the stage
// minus a uniform margin and the top/bottom chrome.
test('uploaded image is maximized within the stage margins (desktop)', async ({ page }) => {
    await openPage(page);
    await uploadSquare(page);

    const m = await fitMetrics(page);

    // The square image must fit inside the available region (margins + chrome).
    expect(m.boxWpx).toBeLessThanOrEqual(m.availW + 1);
    expect(m.boxHpx).toBeLessThanOrEqual(m.availH + 1);
    // ...and be maximized: at least one axis fills the available space.
    expect(Math.max(m.boxWpx / m.availW, m.boxHpx / m.availH)).toBeGreaterThan(0.9);
});

test('uploaded image keeps clearances on a portrait-ish desktop window', async ({ page }) => {
    // Narrow-but-desktop window: the stage is portrait-ish (height < width ratio),
    // so the height constraint is the binding one in the unified fit.
    await page.setViewportSize({ width: 1000, height: 800 });
    await page.goto('/');
    await waitForRender(page);
    await uploadSquare(page);

    const m = await fitMetrics(page);

    // The fit must honor the margins on both axes, keep a square source square,
    // and never push the image past the stage's horizontal edges.
    expect(m.boxWpx).toBeLessThanOrEqual(m.availW + 1);
    expect(m.boxHpx).toBeLessThanOrEqual(m.availH + 1);
    expect(Math.max(m.boxWpx / m.availW, m.boxHpx / m.availH)).toBeGreaterThan(0.9);

    const aspect = await page.evaluate(() => {
        const home = window.__artzDebug._render().particles.geometry.attributes.homePosition.array;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let i = 0; i < home.length; i += 3) {
            if (home[i] < minX) minX = home[i];
            if (home[i] > maxX) maxX = home[i];
            if (home[i + 1] < minY) minY = home[i + 1];
            if (home[i + 1] > maxY) maxY = home[i + 1];
        }
        return (maxX - minX) / (maxY - minY);
    });
    expect(Math.abs(aspect - 1)).toBeLessThan(0.15);
});
