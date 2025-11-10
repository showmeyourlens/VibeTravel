import { BasePage } from "./BasePage";

/**
 * Login Page Object Model
 * Encapsulates interactions with the login page
 */
export class LoginPage extends BasePage {
  /**
   * Navigate to the login page
   */
  async navigateToLogin() {
    await this.goto("/login");
    await this.waitForPageLoad();
  }

  /**
   * Fill the email input field
   */
  async fillEmail(email: string) {
    const emailInput = this.page.locator('input[id="email"]');
    await emailInput.fill(email);
  }

  /**
   * Fill the password input field
   */
  async fillPassword(password: string) {
    const passwordInput = this.page.locator('input[id="password"]');
    await passwordInput.fill(password);
  }

  /**
   * Click the login button
   */
  async clickLoginButton() {
    const loginButton = this.page.locator("button[type='submit']");
    await loginButton.click();
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }

  /**
   * Wait for login to complete (redirect to dashboard)
   */
  async waitForLoginComplete(timeout = 30000) {
    await this.waitForUrl("/", timeout);
  }

  /**
   * Get error message if login fails
   */
  async getErrorMessage(): Promise<string> {
    const errorElement = this.page.locator("p.text-destructive");
    return (await errorElement.textContent()) || "";
  }

  /**
   * Check if error message is visible
   */
  async isErrorMessageVisible(): Promise<boolean> {
    try {
      await this.page.locator("p.text-destructive").waitFor({ state: "visible", timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }
}
