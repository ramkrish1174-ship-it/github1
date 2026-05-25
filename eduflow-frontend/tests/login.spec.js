import { test, expect } from '@playwright/test';

test('user can login successfully', async ({ page }) => {

  await page.goto('http://localhost:5173/login');

  // Fill email
  await page.getByPlaceholder('Email').fill('test@gmail.com');

  // Fill password
  await page.getByPlaceholder('Password').fill('123456');

  // Click login button
  await page.getByRole('button', { name: 'Login' }).click();

  // Verify redirect
  await expect(page).toHaveURL(/dashboard/);

});