import { expect, Page } from "@playwright/test";
import { MockObservationStationCollection } from "./MockObservationStationCollection";

/**
 * Sets up mock API responses for weather observations and navigates to the specified URL.
 * This prevents random test failure due to network issues or rate limiting.
 *
 * @param page - The Playwright `Page` object used to interact with the browser.
 * @param observations - A collection of mock observation station data to be returned by the mocked API.
 * @param url - (Optional) The URL to navigate to after setting up the mocks. Defaults to 'http://127.0.0.1:3000/weather'.
 *
 * @remarks
 * This function intercepts requests to `weather.gov` and fulfills them with the provided mock data.
 * After navigating to the specified URL, it verifies that the element with the ID `#mockwarning` is visible.
 *
 */
export default async (page: Page, observations: MockObservationStationCollection, url?: string) => {
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