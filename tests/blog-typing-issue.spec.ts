import { test, expect } from '@playwright/test';

test.describe('Blog Typing Fix Verification', () => {
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

  test('should allow normal typing in blog content area after fix', async ({ page }) => {
    // Navigate to admin dashboard and directly to blog tab
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Wait longer and use more reliable selector
    await page.waitForTimeout(3000);
    const blogTab = page.locator('button:has-text("Blog")');
    await blogTab.click();
    await page.waitForTimeout(3000);

    // Click New Post button
    const newPostButton = page.locator('text=New Post');
    await expect(newPostButton).toBeVisible();
    await newPostButton.click();
    await page.waitForTimeout(1000);

    // Check if create dialog opened
    const createDialog = page.locator('text=Create New Blog Post');
    await expect(createDialog).toBeVisible();

    // Test title input
    const titleInput = page.locator('input[placeholder*="Enter post title"]');
    await expect(titleInput).toBeVisible();
    await titleInput.click();
    await titleInput.fill('Test Blog Post Title');
    
    let titleValue = await titleInput.inputValue();
    console.log('Title value:', titleValue);
    expect(titleValue).toBe('Test Blog Post Title');

    // Test excerpt textarea
    const excerptTextarea = page.locator('textarea[placeholder*="Brief description"]');
    await expect(excerptTextarea).toBeVisible();
    await excerptTextarea.click();
    await excerptTextarea.fill('This is a test excerpt.');
    
    let excerptValue = await excerptTextarea.inputValue();
    console.log('Excerpt value:', excerptValue);
    expect(excerptValue).toBe('This is a test excerpt.');

    // Test content textarea (main issue area)
    const contentTextarea = page.locator('textarea[placeholder*="Write your blog post"]');
    await expect(contentTextarea).toBeVisible();
    
    // Focus the textarea
    await contentTextarea.click();
    await page.waitForTimeout(500);
    
    // Try typing naturally
    await contentTextarea.fill('This is a test blog post content with multiple words and characters!');
    await page.waitForTimeout(1000);
    
    // Check if the text was actually entered
    const textareaValue = await contentTextarea.inputValue();
    console.log('Textarea value:', textareaValue);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'blog-typing-fixed.png', fullPage: true });
    
    expect(textareaValue).toBe('This is a test blog post content with multiple words and characters!');
    
    console.log('✅ All input fields working correctly - typing issue fixed!');
  });
});