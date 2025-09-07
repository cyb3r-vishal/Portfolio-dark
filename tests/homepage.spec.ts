import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load without infinite re-renders', async ({ page }) => {
    // Track console errors to catch infinite re-render issues
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check that there are no React infinite loop errors
    const hasInfiniteRenderError = errors.some(error => 
      error.includes('Maximum update depth exceeded') || 
      error.includes('infinite loop') ||
      error.includes('setState')
    );
    
    expect(hasInfiniteRenderError).toBeFalsy();
    
    // Verify main sections are present (no blog section should be here)
    await expect(page.locator('h1')).toBeVisible(); // Hero title
    await expect(page.locator('section[id="about"], h2:has-text("ABOUT")')).toBeVisible();
    await expect(page.locator('section[id="projects"], h2:has-text("PROJECTS")')).toBeVisible();
    await expect(page.locator('section[id="contact"], h2:has-text("CONTACT")')).toBeVisible();
    
    // Verify blog section is NOT on homepage anymore
    const blogSectionExists = await page.locator('section:has-text("Latest Blog Posts")').isVisible().catch(() => false);
    expect(blogSectionExists).toBeFalsy();
  });

  test('should have functional navbar with blog link', async ({ page }) => {
    await page.goto('/');
    
    // Wait for navbar to be visible
    await expect(page.locator('header')).toBeVisible();
    
    // Check that blog link exists in navbar
    const blogLink = page.locator('nav a:has-text("BLOG"), nav [href="/blog"]');
    await expect(blogLink).toBeVisible();
    
    // Verify other nav items work with scroll behavior
    const homeLink = page.locator('nav a:has-text("HOME")');
    const aboutLink = page.locator('nav a[href="#about"]');
    const projectsLink = page.locator('nav a[href="#projects"]');
    const contactLink = page.locator('nav a[href="#contact"]');
    
    await expect(homeLink).toBeVisible();
    await expect(aboutLink).toBeVisible();
    await expect(projectsLink).toBeVisible();
    await expect(contactLink).toBeVisible();
  });
});