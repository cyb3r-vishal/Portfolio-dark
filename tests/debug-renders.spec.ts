import { test, expect } from '@playwright/test';

test('debug infinite renders', async ({ page }) => {
  // Track ALL console messages to understand the source
  const allMessages: string[] = [];
  page.on('console', msg => {
    allMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  // Set up admin auth
  await page.goto('/admin/login');
  await page.evaluate(() => {
    const user = { id: 'test-admin', email: 'admin@test.com' };
    const session = {
      user,
      timestamp: Date.now(),
      expires: Date.now() + (30 * 60 * 1000)
    };
    localStorage.setItem('admin_session', JSON.stringify(session));
  });

  // Navigate to admin dashboard
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Click on Blog tab
  const blogTab = page.locator('[role="tab"]:has-text("Blog")').first();
  if (await blogTab.isVisible()) {
    await blogTab.click();
    await page.waitForTimeout(3000);
  }

  // Output all console messages for debugging
  console.log('=== ALL CONSOLE MESSAGES ===');
  allMessages.forEach((msg, i) => console.log(`${i + 1}: ${msg}`));

  // Filter for infinite render errors
  const infiniteRenderErrors = allMessages.filter(msg => 
    msg.includes('Maximum update depth')
  );
  
  console.log(`\n=== INFINITE RENDER ERRORS: ${infiniteRenderErrors.length} ===`);
  infiniteRenderErrors.forEach(error => console.log(error));

  // This will always pass - we just want to see the messages
  expect(true).toBe(true);
});