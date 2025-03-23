import { test, expect, Page } from '@playwright/test';
import { MockObservationStationCollection } from './MockObservationStationCollection';
import mockObservations from './mockObservations';
import mockEmptyObservations from './mockEmptyObservations';

// mock the data so we don't have to rely on the network
// also avoids inadvertently DDoSing the weather api
const setupAndNavigate = async (page: Page, observations: MockObservationStationCollection, url?: string) => {
  if (!url) {
    url = 'http://127.0.0.1:3000/weather';
  }

  await page.route(/weather.gov/, route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(observations)
  }));

  await page.goto(url);
  await expect(page.locator('#mockwarning')).toBeVisible();
}

test('Render Header', async ({ page }) => {
  await setupAndNavigate(page, mockObservations);

  const headerRegex = new RegExp(/(\d+\.?\d*\s?[a-zA-Z%°]*\sas\sof\s\d*\s?[a-zA-Z]*)/);
  await expect(page.getByText(headerRegex)).toBeVisible();

  const subheaderRegex = new RegExp(/^([A-Za-z]{4})\sat\s(\d{1,2}\/\d{1,2}\/\d{4},\s([01]\d|2[0-3]):\d{2}\s[A-Za-z]{3})$/);
  await expect(page.getByText(subheaderRegex)).toBeVisible();
});

test('Render Chart', async ({ page, browserName }) => {
  await setupAndNavigate(page, mockObservations);

  // this test verifies that the chart is showing *something*
  // we are not testing that it is displaying accurately

  // is the chart div even visible?
  await expect(page.locator('#chart')).toBeVisible();

  // does the chart have grid lines?
  const gridLineCount = await page.locator('#gridlines line').count();
  expect(gridLineCount).toBeGreaterThanOrEqual(15);

  // does it have labels?
  const labelCount = await page.locator('#labels foreignObject span').count();
  expect(labelCount).toBeGreaterThanOrEqual(10);

  const dataPoints = await page.locator('#datapoints path').getAttribute('d');
  const dataPointCount = dataPoints?.split('L').length;

  expect(dataPointCount).toBeGreaterThanOrEqual(20);

  await page.screenshot({
    path: `./screenshots/${browserName}.png`,
    fullPage: true
  });
});

test('Render Navigation', async ({ page }) => {
  await setupAndNavigate(page, mockObservations);
  
  await expect(page.locator('#navigation div')).toHaveCount(5);
  await expect(page.locator('#navigation div')).toHaveText(['Temp', 'Dew Point', 'Humidity', 'Pressure', 'Wind']);
});

test('Render Scale', async ({ page }) => {
  await setupAndNavigate(page, mockObservations);
  await expect(page.locator('#scale div')).toHaveCount(3);
  await expect(page.locator('#scale div')).toHaveText(['1 day', '3 day', '5 day']);
});

test('Invalid station shows error message', async ({ page }) => {
  await setupAndNavigate(page, mockEmptyObservations, 'http://127.0.0.1:3000/weather?airport=XYYZ');
  await expect(page.locator('h2')).toHaveText('No observations from XYYZ');
});