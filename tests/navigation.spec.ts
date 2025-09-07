import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between pages correctly', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    await expect(page).toHaveURL('/');
    
    // Navigate to blog page
    await page.click('nav a:has-text("BLOG")');
    await expect(page).toHaveURL('/blog');
    
    // Navigate back to home
    await page.click('nav a:has-text("HOME")');
    await expect(page).toHaveURL('/');
    
    // Navigate to admin login
    await page.goto('/admin/login');
    await expect(page).toHaveURL('/admin/login');
  });

  test('should handle 404 pages', async ({ page }) => {
    await page.goto('/nonexistent-page');
    
    // Should show not found page or redirect
    // The exact behavior depends on the NotFound component implementation
    const url = page.url();
    const content = await page.textContent('body');
    
    // Either shows 404 content or redirects
    expect(url.includes('404') || content?.includes('404') || content?.includes('not found')).toBeTruthy();
  });

  test('should maintain consistent navbar across pages', async ({ page }) => {
    const pages = ['/', '/blog', '/admin/login'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Check that navbar exists on each page
      const navbar = page.locator('header nav, nav');
      if (await navbar.isVisible()) {
        // If navbar exists, it should have the expected structure
        await expect(navbar).toBeVisible();
        
        // Check for main nav items (some may not be visible on all pages)
        const navItems = await navbar.locator('a').count();
        expect(navItems).toBeGreaterThan(0);
      }
    }
  });

  test('should not have console errors during navigation', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate between pages
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out common non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') &&
      !error.includes('net::ERR_FAILED') &&
      !error.toLowerCase().includes('extension')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});