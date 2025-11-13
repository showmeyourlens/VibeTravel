import type { Page } from "@playwright/test";

/**
 * Test Helpers Utilities
 * Common utility functions for e2e tests
 */

/**
 * Wait for element with specific test id to be stable (not changing)
 */
export async function waitForElementStable(page: Page, testId: string, timeout = 5000) {
  const startTime = Date.now();
  const element = page.getByTestId(testId);

  while (Date.now() - startTime < timeout) {
    try {
      await element.waitFor({ state: "visible", timeout: 1000 });
      // Wait a bit more to ensure it's stable
      await page.waitForTimeout(200);
      return;
    } catch {
      // Element might be changing, try again
      continue;
    }
  }

  throw new Error(`Element with test id "${testId}" did not become stable within ${timeout}ms`);
}

/**
 * Take a screenshot of a specific test element
 */
export async function screenshotElement(page: Page, testId: string, filename: string) {
  const element = page.getByTestId(testId);
  await element.screenshot({ path: `screenshots/${filename}.png` });
}

/**
 * Wait for multiple test ids to be visible
 */
export async function waitForMultipleTestIds(page: Page, testIds: string[], timeout = 5000) {
  const promises = testIds.map((testId) => page.getByTestId(testId).waitFor({ state: "visible", timeout }));
  await Promise.all(promises);
}

/**
 * Check if element is enabled
 */
export async function isElementEnabled(page: Page, testId: string): Promise<boolean> {
  const element = page.getByTestId(testId);
  return element.isEnabled();
}

/**
 * Check if element is disabled
 */
export async function isElementDisabled(page: Page, testId: string): Promise<boolean> {
  return !(await isElementEnabled(page, testId));
}

/**
 * Get attribute value of element
 */
export async function getElementAttribute(page: Page, testId: string, attribute: string): Promise<string | null> {
  return page.getByTestId(testId).getAttribute(attribute);
}

/**
 * Get all text content from multiple elements with same selector prefix
 */
export async function getMultipleElementsText(page: Page, selectorPrefix: string): Promise<string[]> {
  const elements = page.locator(`[data-testid^="${selectorPrefix}"]`);
  const count = await elements.count();
  const texts = [];

  for (let i = 0; i < count; i++) {
    const text = await elements.nth(i).textContent();
    if (text) {
      texts.push(text.trim());
    }
  }

  return texts;
}

/**
 * Click element and wait for navigation
 */
export async function clickAndWaitForNavigation(page: Page, testId: string, urlPattern: string | RegExp) {
  const navigationPromise = page.waitForURL(urlPattern);
  await page.getByTestId(testId).click();
  await navigationPromise;
}

/**
 * Retry action multiple times with exponential backoff
 */
export async function retryAction<T>(action: () => Promise<T>, maxRetries = 3, delayMs = 1000): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (i < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Action failed after retries");
}

/**
 * Wait for specific text to appear on page
 */
export async function waitForText(page: Page, text: string, timeout = 5000) {
  await page.getByText(text).waitFor({ state: "visible", timeout });
}

/**
 * Get localStorage item
 */
export async function getLocalStorageItem(page: Page, key: string): Promise<string | null> {
  return page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
}

/**
 * Set localStorage item
 */
export async function setLocalStorageItem(page: Page, key: string, value: string) {
  await page.evaluate(
    ([storageKey, storageValue]) => {
      localStorage.setItem(storageKey, storageValue);
    },
    [key, value]
  );
}

/**
 * Clear localStorage
 */
export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
}

/**
 * Get session storage item
 */
export async function getSessionStorageItem(page: Page, key: string): Promise<string | null> {
  return page.evaluate((storageKey) => sessionStorage.getItem(storageKey), key);
}

/**
 * Take visual comparison screenshot
 */
export async function takeVisualSnapshot(page: Page, name: string) {
  await page.screenshot({ path: `visual-snapshots/${name}.png`, fullPage: true });
}

/**
 * Log message with timestamp
 */
export function logTest(message: string) {
  const timestamp = new Date().toISOString();
  // eslint-disable-next-line no-console
  console.log(`[${timestamp}] ${message}`);
}
