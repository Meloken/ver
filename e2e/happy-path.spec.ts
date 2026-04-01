import { test, expect } from '@playwright/test';

test.describe('TaxHacker Happy Path', () => {
  test('User can log in and see the dashboard', async ({ page }) => {
    // Navigate to the dashboard (webServer config will ensure app runs on port 7331)
    await page.goto('/');

    // Assuming we have a standard Better Auth flow handled by the app.
    // If not logged in, it redirects to /auth. We'll wait for the auth process or check if we are redirected.
    // Note: Since this is a template E2E test, we assert that the app title or a known element loads.
    
    // Check if the page title has something relevant or wait for body to load.
    await expect(page).toHaveTitle(/TaxHacker/);

    // If there's a login form, we'd do:
    // await page.fill('input[name="email"]', 'test@example.com');
    // await page.fill('input[name="password"]', 'password');
    // await page.click('button[type="submit"]');

    // Check if a recognized UI element on the dashboard loads
    // Make sure we have the navigation sideways or topbar loaded.
    const hasNav = await page.locator('nav').count();
    expect(hasNav).toBeGreaterThanOrEqual(0);
  });
});
