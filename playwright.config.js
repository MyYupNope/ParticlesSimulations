import { defineConfig, devices } from '@playwright/test';

// Browser test configuration for ParticlesSimulations.
// Tests run against the production build served by `vite preview` so worker URL
// resolution and the /ParticlesSimulations/ base path match the deployed environment.
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 2,
    reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
    timeout: 60_000,
    expect: { timeout: 15_000 },

    use: {
        baseURL: 'http://127.0.0.1:4173/ParticlesSimulations/',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },

    webServer: {
        command: 'npm run preview -- --host 127.0.0.1 --port 4173',
        url: 'http://127.0.0.1:4173/ParticlesSimulations/',
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
    },

    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                launchOptions: { args: ['--use-angle=swiftshader'] },
            },
        },
    ],
});
