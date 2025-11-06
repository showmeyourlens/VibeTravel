import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Plan Wizard Page Object
 * Handles interactions with the multi-step plan creation wizard
 */
export class PlanWizardPage extends BasePage {
  // Test IDs for wizard elements
  private readonly WIZARD_CONTAINER = "plan-wizard";
  private readonly STEP_CONTENT = "wizard-step-content";
  private readonly BACK_BUTTON = "btn-back";

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to plan wizard page
   */
  async goto() {
    await super.goto("/plans/new");
  }

  /**
   * Verify wizard page is loaded
   */
  async verifyWizardLoaded() {
    await this.waitForTestId(this.WIZARD_CONTAINER);
    await this.waitForTestId(this.STEP_CONTENT);
  }

  /**
   * Check if wizard is visible
   */
  async isWizardVisible(): Promise<boolean> {
    return this.isTestIdVisible(this.WIZARD_CONTAINER);
  }

  /**
   * Check if back button is visible (shown on steps 2+)
   */
  async isBackButtonVisible(): Promise<boolean> {
    return this.isTestIdVisible(this.BACK_BUTTON);
  }

  /**
   * Click the back button to go to previous step
   */
  async clickBack() {
    await this.clickByTestId(this.BACK_BUTTON);
  }

  /**
   * Get step content element for assertions
   */
  getStepContent() {
    return this.getByTestId(this.STEP_CONTENT);
  }

  /**
   * Complete the full wizard flow
   */
  async completeWizardFlow(
    citySelector: string,
    durationDays: number,
    intensity: "half-day" | "full-day"
  ) {
    // Step 1: Select destination
    await this.selectCity(citySelector);

    // Step 2: Select duration
    await this.selectDuration(durationDays);

    // Step 3: Select intensity
    await this.selectIntensity(intensity);

    // Step 4: Generate plan
    await this.generatePlan();
  }

  /**
   * Select a city from the destination step
   */
  async selectCity(citySelector: string) {
    await this.clickByTestId(citySelector);
  }

  /**
   * Select duration from the duration step
   */
  async selectDuration(days: number) {
    const testId = `btn-select-duration-${days}`;
    await this.clickByTestId(testId);
  }

  /**
   * Select travel intensity (half day or full day)
   */
  async selectIntensity(intensity: "half-day" | "full-day") {
    const testId = `btn-select-intensity-${intensity}`;
    await this.clickByTestId(testId);
  }

  /**
   * Click the generate plan button
   */
  async generatePlan() {
    await this.clickByTestId("btn-generate-plan");
  }

  /**
   * Get any available city button (for flexible test selection)
   */
  async getFirstCityButton() {
    return this.page.locator('[data-testid^="btn-select-city-"]').first();
  }

  /**
   * Select the first available city
   */
  async selectFirstAvailableCity() {
    const cityButton = await this.getFirstCityButton();
    await cityButton.click();
  }
}

