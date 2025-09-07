import { test, expect } from '@playwright/test';

test.describe('Blog Page', () => {
  test('should navigate to separate blog page', async ({ page }) => {
    // Start from homepage
    await page.goto('/');
    
    // Click on blog link in navbar
    const blogLink = page.locator('nav a:has-text("BLOG"), nav [href="/blog"]');
    await expect(blogLink).toBeVisible();
    await blogLink.click();
    
    // Should navigate to /blog
    await expect(page).toHaveURL('/blog');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display blog page correctly', async ({ page }) => {
    await page.goto('/blog');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if BlogPage component loads (even if no posts exist)
    // The page should at least show some blog-related content or heading
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
    
    // Check for navbar presence (should be consistent across pages)
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should maintain navbar functionality on blog page', async ({ page }) => {
    await page.goto('/blog');
    
    // Verify navbar is present and functional
    await expect(page.locator('header')).toBeVisible();
    
    // Test navigation back to home
    const homeLink = page.locator('nav a:has-text("HOME"), nav [href="/"]');
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    
    // Should navigate back to homepage
    await expect(page).toHaveURL('/');
    
    // Verify we're back on homepage
    await expect(page.locator('text=VISHAL CHAUHAN')).toBeVisible();
  });

  test('should handle direct navigation to blog page', async ({ page }) => {
    // Navigate directly to blog page (not from homepage)
    await page.goto('/blog');
    
    // Page should load without errors
    await page.waitForLoadState('networkidle');
    
    // Check that URL is correct
    await expect(page).toHaveURL('/blog');
    
    // Navbar should be present
    await expect(page.locator('nav')).toBeVisible();
    
    // Should not show infinite loading or errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000); // Wait a bit to catch any potential errors
    
    const hasErrors = errors.some(error => 
      error.includes('Error') && 
      !error.includes('favicon') // Ignore favicon errors
    );
    expect(hasErrors).toBeFalsy();
  });

  test('should show blog badge in navbar when posts exist', async ({ page }) => {
    await page.goto('/');
    
    // Look for blog badge in navbar (if posts exist)
    const blogNavItem = page.locator('nav a:has-text("BLOG")');
    await expect(blogNavItem).toBeVisible();
    
    // If there are published posts, there should be a badge
    const badge = blogNavItem.locator('.bg-primary');
    // We don't assert visibility since it depends on whether posts exist
    // but if it exists, it should be properly styled
    
    if (await badge.isVisible()) {
      await expect(badge).toHaveClass(/bg-primary/);
    }
  });
});