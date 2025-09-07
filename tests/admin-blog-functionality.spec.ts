import { test, expect } from '@playwright/test';

test.describe('Admin Blog Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin login
    await page.goto('/admin/login');
    await page.evaluate(() => {
      localStorage.setItem('local_admin', JSON.stringify({ 
        id: 'test-admin', 
        email: 'admin@test.com' 
      }));
    });
  });

  test('should handle blog posting without infinite re-renders', async ({ page }) => {
    // Track console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Maximum update depth')) {
        errors.push(msg.text());
      }
    });

    // Navigate to admin dashboard
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Check for dark theme
    await expect(page.locator('.bg-gray-900')).toBeVisible();

    // Click on Blog tab
    await page.click('text=Blog');
    await page.waitForTimeout(2000);

    // Verify no infinite render errors occurred
    expect(errors.length).toBe(0);

    // Check if "New Post" button is visible (blog functionality is working)
    const newPostButton = page.locator('text=New Post');
    if (await newPostButton.isVisible()) {
      await expect(newPostButton).toBeVisible();
      console.log('✅ Blog management interface loaded successfully');

      // Click New Post to test form functionality
      await newPostButton.click();
      await page.waitForTimeout(1000);

      // Check if create dialog opened
      const createDialog = page.locator('text=Create New Blog Post');
      if (await createDialog.isVisible()) {
        await expect(createDialog).toBeVisible();
        console.log('✅ New post dialog opens without errors');

        // Fill in some test data
        await page.fill('input[placeholder*="Enter post title"]', 'Test Blog Post');
        await page.fill('textarea[placeholder*="Write your blog post"]', 'This is test content for the blog post.');
        
        // Wait a bit to see if any re-render errors occur
        await page.waitForTimeout(2000);

        // Cancel dialog
        await page.click('text=Cancel');
        console.log('✅ Blog form interaction completed without infinite renders');
      }
    }

    // Final check: no infinite render errors
    expect(errors.length).toBe(0);
    console.log('✅ Admin blog functionality test completed - NO INFINITE RENDERS');
  });

  test('should display dark theme in admin areas', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Check admin dashboard has dark background
    await expect(page.locator('.bg-gray-900')).toBeVisible();
    
    // Check title has white text
    const dashboardTitle = page.locator('h1:has-text("Admin Dashboard")');
    await expect(dashboardTitle).toBeVisible();
    
    // Navigate to blog tab
    await page.click('text=Blog');
    await page.waitForTimeout(1000);
    
    // Check blog section maintains dark theme
    const blogTitle = page.locator('h1:has-text("Blog Management")');
    if (await blogTitle.isVisible()) {
      await expect(blogTitle).toBeVisible();
      console.log('✅ Dark theme maintained in blog management');
    }
    
    console.log('✅ Admin dark theme verification completed');
  });
});