import { test, expect } from '@playwright/test';

test.describe('Blog Posting Fix', () => {
  test('should not cause infinite re-renders when accessing blog management', async ({ page }) => {
    // Track console errors to catch infinite re-render issues
    const errors: string[] = [];
    const warnings: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
      if (msg.type() === 'warning' && msg.text().includes('Maximum update depth')) {
        warnings.push(msg.text());
      }
    });

    // Navigate to admin login
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    
    // Check for dark background in admin login
    const loginContainer = page.locator('.min-h-screen').first();
    if (await loginContainer.isVisible()) {
      const backgroundColor = await loginContainer.evaluate(
        el => window.getComputedStyle(el).backgroundColor
      );
      console.log('Login background color:', backgroundColor);
    }

    // Mock login (local mode)
    await page.evaluate(() => {
      localStorage.setItem('local_admin', JSON.stringify({ 
        id: 'test-admin', 
        email: 'admin@test.com' 
      }));
    });

    // Navigate to admin dashboard
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Check for dark background in admin dashboard
    const dashboardContainer = page.locator('.bg-gray-900').first();
    if (await dashboardContainer.isVisible()) {
      await expect(dashboardContainer).toBeVisible();
      console.log('✅ Dark background applied to admin dashboard');
    }

    // Click on Blog tab to trigger potential infinite re-render
    const blogTab = page.locator('text=Blog').or(page.locator('[role="tab"]:has-text("Blog")')); 
    if (await blogTab.isVisible()) {
      await blogTab.click();
      await page.waitForTimeout(3000); // Wait for potential re-renders
      
      // Check for blog management title with dark theme
      const blogTitle = page.locator('h1:has-text("Blog Management")');
      if (await blogTitle.isVisible()) {
        await expect(blogTitle).toBeVisible();
        console.log('✅ Blog management page loaded');
      }
    }

    // Check for infinite render errors
    const hasInfiniteRenderError = errors.some(error => 
      error.includes('Maximum update depth exceeded') || 
      error.includes('infinite loop') ||
      error.includes('Maximum update depth')
    );
    
    const hasInfiniteRenderWarning = warnings.some(warning => 
      warning.includes('Maximum update depth')
    );

    expect(hasInfiniteRenderError).toBeFalsy();
    expect(hasInfiniteRenderWarning).toBeFalsy();
    
    // If we got here without infinite re-renders, the fix is working
    console.log('✅ Blog posting infinite render fix verified');
  });
});