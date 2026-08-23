import { test, expect } from '@playwright/test';
import { waitForRender } from './helpers';

async function openPage(page, query = '/') {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(query);
    await waitForRender(page);
}

test('clicking the wordmark plays the flourishes back to back in a loop', async ({ page }) => {
    await openPage(page);

    const wordmark = page.locator('#wordmark');
    await expect(wordmark).toBeVisible();

    // 8 letter spans spell KINETICS.
    expect(await wordmark.locator('.title-letter').count()).toBe(8);
    expect((await wordmark.locator('.title-letter').allTextContents()).join('')).toBe('KINETICS');

    // First click starts the showcase with the ripple-cascade wave...
    await wordmark.click();
    await expect(wordmark).toHaveClass(/is-rippling/);

    // ...then it advances to the dissolve-and-reform burst, then the gravity
    // drop, then the black hole singularity implosion, then wraps back around to
    // the ripple. Each flourish plays once.
    await expect(wordmark).toHaveClass(/is-playing/, { timeout: 6000 });
    await expect(wordmark).toHaveClass(/is-dropping/, { timeout: 6000 });
    await expect(wordmark).toHaveClass(/is-imploding/, { timeout: 6000 });
    await expect(wordmark).toHaveClass(/is-rippling/, { timeout: 6000 });
});

test('clicking the wordmark again stops the showcase until re-clicked', async ({ page }) => {
    await openPage(page);

    const wordmark = page.locator('#wordmark');
    await wordmark.click();
    await expect(wordmark).toHaveClass(/is-rippling/);

    // Confirm it advances to the next flourish on its own before stopping.
    await expect(wordmark).toHaveClass(/is-playing/, { timeout: 6000 });

    // Stopping removes the running flourish immediately...
    await wordmark.click();
    await expect(wordmark).not.toHaveClass(/is-(playing|rippling|dropping|imploding)/);

    // ...and no further flourishes are scheduled.
    await page.waitForTimeout(3500);
    await expect(wordmark).not.toHaveClass(/is-(playing|rippling|dropping|imploding)/);

    // Clicking once more restarts the showcase from the first variant...
    await wordmark.click();
    await expect(wordmark).toHaveClass(/is-rippling/);

    // ...and it keeps cycling from there.
    await expect(wordmark).toHaveClass(/is-playing/, { timeout: 6000 });
});

test('wordmark showcase is skipped under prefers-reduced-motion', async ({ page }) => {
    // Emulate reduced motion so the app's matchMedia change listener fires.
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await waitForRender(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const wordmark = page.locator('#wordmark');
    for (let i = 0; i < 3; i++) {
        await wordmark.click();
        await page.waitForTimeout(300);
        await expect(wordmark).not.toHaveClass(/is-(playing|rippling|dropping|imploding)/);
    }
});
