import { test, expect } from '@playwright/test';
import mockObservations from './mockObservations';
import setupMocksAndNavigate from './setupMocksAndNavigate';

test('Geolocation permission shows autolocate', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'Mobile Safari')
    {
         test.skip();
    }

    await setupMocksAndNavigate(page, mockObservations);

    page.context().grantPermissions(['geolocation']);

    await expect(page.locator('#autolocate')).toBeVisible();
});

test('Editing location changes station', async ({ page }) => {
    await setupMocksAndNavigate(page, mockObservations);

    await expect(page.locator('#edit')).toBeVisible();

    page.on('dialog', dialog => dialog.accept('KBOS'));

    await page.locator('#edit').click();
    
    expect(page.url()).toContain("airport=KBOS");
});