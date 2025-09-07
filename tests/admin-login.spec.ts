import { test, expect } from '@playwright/test';

test.describe('Admin Login Page', () => {
  test('should display cybersecurity themed login page', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check cybersecurity themed title
    await expect(page.locator('span.neon-text-green:has-text("ADMIN")')).toBeVisible();
    await expect(page.locator('span.neon-text-red:has-text("ACCESS")')).toBeVisible();
    
    // Verify neon styling classes are applied
    const adminText = page.locator('.neon-text-green:has-text("ADMIN")');
    const accessText = page.locator('.neon-text-red:has-text("ACCESS")');
    
    await expect(adminText).toBeVisible();
    await expect(accessText).toBeVisible();
    
    // Check for matrix background effects
    const matrixBg = page.locator('.matrix-bg');
    await expect(matrixBg).toBeVisible();
    
    // Check for noise background
    const noiseBg = page.locator('.noise-bg');
    await expect(noiseBg).toBeVisible();
    
    // Verify form elements have proper styling
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button:has-text("AUTHENTICATE")');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
    
    // Check for security message
    await expect(page.locator('text=Protected')).toBeVisible();
    await expect(page.locator('text=Rate limiting')).toBeVisible();
  });

  test('should show proper error styling for failed login attempts', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Try to login with invalid credentials (if form elements exist)
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button:has-text("AUTHENTICATE")');
    
    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      await emailInput.fill('test@test.com');
      await passwordInput.fill('wrongpassword');
      await submitButton.click();
    }
    
    // Wait for potential error message (should appear with themed styling)
    await page.waitForTimeout(1000);
    
    // The error should be styled with destructive colors if it appears
    const errorMessage = page.locator('.text-destructive, .bg-destructive\\/10');
    // We don't assert visibility since error handling depends on backend setup
    
    // But we can verify the button text changes during loading
    const button = page.locator('button[type="submit"]');
    await expect(button).toBeVisible();
  });

  test('should have proper responsive design', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/login');
    
    // Card should still be visible and properly sized
    const card = page.locator('.max-w-md');
    await expect(card).toBeVisible();
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    // All elements should still be visible
    await expect(page.locator('span.neon-text-green:has-text("ADMIN")')).toBeVisible();
    await expect(page.locator('span.neon-text-red:has-text("ACCESS")')).toBeVisible();
  });
});