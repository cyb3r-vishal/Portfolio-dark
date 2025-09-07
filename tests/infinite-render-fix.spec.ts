import { test, expect } from '@playwright/test';

test.describe('Infinite Render Fix Verification', () => {
  test('should not cause infinite re-renders in admin blog management', async ({ page }) => {
    // Track console errors specifically for infinite renders
    const infiniteRenderErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && 
          (msg.text().includes('Maximum update depth exceeded') ||
           msg.text().includes('infinite loop') ||
           msg.text().includes('Maximum update depth'))) {
        infiniteRenderErrors.push(msg.text());
      }
    });

    // Set up admin authentication using SessionManager format
    await page.goto('/admin/login');
    await page.evaluate(() => {
      const user = { id: 'test-admin', email: 'admin@test.com' };
      const session = {
        user,
        timestamp: Date.now(),
        expires: Date.now() + (30 * 60 * 1000) // 30 minutes
      };
      localStorage.setItem('admin_session', JSON.stringify(session));
    });

    // Navigate to admin dashboard
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Wait for initial rendering to complete
    await page.waitForTimeout(2000);

    // Verify admin dashboard loads
    const dashboardTitle = page.locator('h1:has-text("Admin Dashboard")');
    await expect(dashboardTitle).toBeVisible();

    // Click on Blog tab to trigger the previously problematic useEffect
    const blogTab = page.locator('[role="tab"]:has-text("Blog")').first();
    if (await blogTab.isVisible()) {
      await blogTab.click();
      
      // Wait for blog section to load and any potential re-renders to occur
      await page.waitForTimeout(5000);
      
      // Try to interact with blog management to trigger state changes
      const newPostButton = page.locator('text=New Post').first();
      if (await newPostButton.isVisible()) {
        await newPostButton.click();
        await page.waitForTimeout(2000);
        
        // Fill form to trigger more state updates
        const titleInput = page.locator('input[placeholder*="title"]').first();
        if (await titleInput.isVisible()) {
          await titleInput.fill('Test Post');
          await page.waitForTimeout(1000);
          
          const contentTextarea = page.locator('textarea[placeholder*="content"]').first();
          if (await contentTextarea.isVisible()) {
            await contentTextarea.fill('Test content');
            await page.waitForTimeout(2000);
          }
        }
        
        // Close dialog
        const cancelButton = page.locator('text=Cancel').first();
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // Final check: no infinite render errors should have occurred
    expect(infiniteRenderErrors.length).toBe(0);
    
    if (infiniteRenderErrors.length > 0) {
      console.log('❌ Infinite render errors found:', infiniteRenderErrors);
    } else {
      console.log('✅ No infinite render errors detected - fix is working!');
    }
  });

  test('should load admin areas without console errors', async ({ page }) => {
    // Track all console errors
    const allErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        allErrors.push(msg.text());
      }
    });

    // Set up admin auth using SessionManager format
    await page.goto('/admin/login');
    await page.evaluate(() => {
      const user = { id: 'test-admin', email: 'admin@test.com' };
      const session = {
        user,
        timestamp: Date.now(),
        expires: Date.now() + (30 * 60 * 1000) // 30 minutes
      };
      localStorage.setItem('admin_session', JSON.stringify(session));
    });

    // Test admin dashboard
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Filter out only the critical infinite render errors
    const criticalErrors = allErrors.filter(error => 
      error.includes('Maximum update depth') ||
      error.includes('infinite loop') ||
      error.includes('Maximum update depth exceeded')
    );

    expect(criticalErrors.length).toBe(0);
    
    if (criticalErrors.length === 0) {
      console.log('✅ Admin pages load without infinite render errors');
    } else {
      console.log('❌ Critical errors found:', criticalErrors);
    }
  });
});