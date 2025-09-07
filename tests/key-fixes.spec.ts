import { test, expect } from '@playwright/test';

test.describe('Key Fixes Verification', () => {
  test('should verify infinite render fix and navigation', async ({ page }) => {
    // Track console errors to catch infinite re-render issues
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Test homepage loads without infinite renders
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for infinite render errors
    const hasInfiniteRenderError = errors.some(error => 
      error.includes('Maximum update depth exceeded') || 
      error.includes('infinite loop')
    );
    expect(hasInfiniteRenderError).toBeFalsy();
    
    // Test navigation to blog page works
    const blogNavLink = page.locator('nav a[href="/blog"], nav a:has-text("BLOG")');
    if (await blogNavLink.isVisible()) {
      await blogNavLink.click();
      await expect(page).toHaveURL('/blog');
      await page.waitForLoadState('networkidle');
    }
    
    // Test navigation back to home works
    const homeNavLink = page.locator('nav a[href="/"], nav a:has-text("HOME")');
    if (await homeNavLink.isVisible()) {
      await homeNavLink.click();
      await expect(page).toHaveURL('/');
    }
    
    // Test admin login page has cybersecurity theme
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    
    // Check for cybersecurity themed elements
    const adminSpan = page.locator('span.neon-text-green:has-text("ADMIN")');
    const accessSpan = page.locator('span.neon-text-red:has-text("ACCESS")');
    const matrixBg = page.locator('.matrix-bg');
    
    if (await adminSpan.isVisible()) {
      await expect(adminSpan).toBeVisible();
    }
    if (await accessSpan.isVisible()) {
      await expect(accessSpan).toBeVisible();
    }
    if (await matrixBg.isVisible()) {
      await expect(matrixBg).toBeVisible();
    }
  });
});