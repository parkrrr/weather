import { test, expect } from '@playwright/test';
import mockObservations from './mockObservations';
import setupMocksAndNavigate from './setupMocksAndNavigate';

test('Switching themes applies new styles', async ({ page }) => {
  await setupMocksAndNavigate(page, mockObservations);

  await expect(page.locator('html')).toHaveAttribute('data-theme', /light/);

  await page.click('#theme div:has-text("Dark")');
  await expect(page.locator('html')).toHaveAttribute('data-theme', /dark/);

  await page.click('#theme div:has-text("OLED")');
  await expect(page.locator('html')).toHaveAttribute('data-theme', /oled/);

  await page.click('#theme div:has-text("Win95")');
  await expect(page.locator('html')).toHaveAttribute('data-theme', /win95/);
});

test('Selected theme is persisted in localStorage', async ({ page }) => {
    await setupMocksAndNavigate(page, mockObservations);
    await expect(page.locator('html')).toHaveAttribute('data-theme', /light/);

    await page.click('#theme div:has-text("Dark")');
    await expect(page.locator('html')).toHaveAttribute('data-theme', /dark/);

    const themeInStorage = await page.evaluate(() => localStorage.getItem('theme'));
    expect(themeInStorage).toBe('dark');

    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('data-theme', /dark/);
});