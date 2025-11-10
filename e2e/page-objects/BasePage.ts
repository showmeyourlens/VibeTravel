import type { Page } from "@playwright/test";

/**
 * Base Page Object Model class
 * Provides common functionality for all page objects
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to a URL
   */
  async goto(url: string) {
    await this.page.goto(url);
  }

  /**
   * Click an element by test id
   */
  async clickByTestId(testId: string) {
    await this.page.getByTestId(testId).click();
  }

  /**
   * Fill input by test id
   */
  async fillByTestId(testId: string, text: string) {
    await this.page.getByTestId(testId).fill(text);
  }

  /**
   * Get element by test id
   */
  getByTestId(testId: string) {
    return this.page.getByTestId(testId);
  }

  /**
   * Wait for element by test id to be visible
   */
  async waitForTestId(testId: string, timeout = 5000) {
    await this.page.getByTestId(testId).waitFor({ state: "visible", timeout });
  }

  /**
   * Wait for element by test id to be hidden
   */
  async waitForTestIdHidden(testId: string, timeout = 5000) {
    await this.page.getByTestId(testId).waitFor({ state: "hidden", timeout });
  }

  /**
   * Check if element by test id is visible
   */
  async isTestIdVisible(testId: string): Promise<boolean> {
    try {
      await this.page.getByTestId(testId).waitFor({ state: "visible", timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get text content of element by test id
   */
  async getTestIdText(testId: string): Promise<string> {
    return (await this.page.getByTestId(testId).textContent()) || "";
  }

  /**
   * Wait for URL to match pattern
   */
  async waitForUrl(urlPattern: string | RegExp, timeout = 15000) {
    await this.page.waitForURL(urlPattern, { timeout });
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for page load
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState("networkidle");
  }
}
