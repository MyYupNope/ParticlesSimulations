import { test, expect } from '@playwright/test';
import { waitForRender } from './helpers';

async function openPage(page, query = '/') {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(query);
    await waitForRender(page);
}

test('clicking the wordmark plays the dissolve/reform animation and settles', async ({ page }) => {
    await openPage(page);

    const wordmark = page.locator('#wordmark');
    await expect(wordmark).toBeVisible();

    // 8 letter spans spell KINETICS.
    expect(await wordmark.locator('.title-letter').count()).toBe(8);
    expect((await wordmark.locator('.title-letter').allTextContents()).join('')).toBe('KINETICS');

    await wordmark.click();
    await expect(wordmark).toHaveClass(/is-playing/);

    // The animation finishes and the class is removed; letters stay intact.
    await expect(wordmark).not.toHaveClass(/is-playing/, { timeout: 3000 });
    expect((await wordmark.locator('.title-letter').allTextContents()).join('')).toBe('KINETICS');
});

test('re-clicking the wordmark restarts the animation cleanly', async ({ page }) => {
    await openPage(page);

    const wordmark = page.locator('#wordmark');
    await wordmark.click();
    await expect(wordmark).toHaveClass(/is-playing/);

    // A second click mid-animation restarts rather than double-scheduling.
    await wordmark.click();
    await expect(wordmark).toHaveClass(/is-playing/);
    await expect(wordmark).not.toHaveClass(/is-playing/, { timeout: 3000 });
});

test('wordmark animation is skipped under prefers-reduced-motion', async ({ page }) => {
    // Emulate reduced motion so the app's matchMedia change listener fires.
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await waitForRender(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const wordmark = page.locator('#wordmark');
    await wordmark.click();
    await page.waitForTimeout(300);
    await expect(wordmark).not.toHaveClass(/is-playing/);
});
