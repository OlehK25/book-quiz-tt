import { test, expect } from '@playwright/test';

test.describe('Quiz Conversion Funnel', () => {
  
  test('Happy Path: Complete Quiz -> Email -> Thank You', async ({ page }) => {
    // 0. Clear persistence
    await page.goto('/en');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });    
    // 1. Start (Direct to Q1)
    await page.goto('/en/quiz/1');
    // await expect(page).toHaveURL(...) - already there
    
    // Q1: Language (Auto-advance)
    await page.click('text=English');
    // Wait for transition/navigation
    await expect(page).toHaveURL(/\/en\/quiz\/2/);
    
    // Q2: Gender (Auto-advance)
    await page.click('text=Female');
    await expect(page).toHaveURL(/\/en\/quiz\/3/);
    
    // Q3: Age (Auto-advance) -> Select 18-29 (Triggers Logic)
    await page.click('text=18-29 years');
    await expect(page).toHaveURL(/\/en\/quiz\/4/);
    
    // Q4: Hate (Multi-select)
    await page.click('text=Lack of logic');
    await page.getByRole('button', { name: 'Next' }).first().click();
    await expect(page).toHaveURL(/\/en\/quiz\/5/);
    
    // Q5: Topics (Bubble, Conditional)
    // Bonus Check: "Bad Boy" should be visible (mapped to 18-29)
    await expect(page.locator('text=Bad Boy')).toBeVisible();
    
    await page.click('text=Bad Boy');
    await page.click('text=Romance'); // Select min 1
    await page.getByRole('button', { name: 'Next' }).first().click();
    
    // Loader Screen -> Email
    // Wait for loader (5s)
    await expect(page).toHaveURL(/\/en\/quiz\/loading/);
    await expect(page).toHaveURL(/\/en\/quiz\/email/, { timeout: 30000 });
    
    // Email Screen
    // Debug: Check if email is empty
    await expect(page.locator('input[type="email"]')).toHaveValue('');

    // Use .first() to avoid matching Next.js Dev Tools button
    const nextBtn = page.getByRole('button', { name: 'Next' }).first();
    await expect(nextBtn).toHaveAttribute('disabled', '');
    
    await page.fill('input[type="email"]', 'test@holywater.com');
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();
    
    // Thank You Screen
    await expect(page).toHaveURL(/\/en\/quiz\/thank-you/);
    await expect(page.locator('text=Thank you')).toBeVisible();
    
    // CSV Download check (mocking download not strictly needed if button exists)
    await expect(page.getByText('Download my answers')).toBeVisible();
  });

  test('Persistence: Reload should save progress', async ({ page }) => {
    await page.goto('/en/quiz/1');
    await page.click('text=English');
    await expect(page).toHaveURL(/\/en\/quiz\/2/);
    
    // Reload
    await page.reload();
    
    // Should still be on Q2
    await expect(page).toHaveURL(/\/en\/quiz\/2/);
    
    // Go back to Q1 to check language persisted? (Harder to check visualization without inspect store, 
    // but remaining on Q2 proves step persistence).
  });

});
