import { BasePage } from "./BasePage";

/**
 * Itinerary Page Object
 * Handles interactions with the generated plan itinerary view
 */
export class ItineraryPage extends BasePage {
  // Test IDs for itinerary elements
  private readonly ITINERARY_VIEW = "itinerary-view";
  private readonly SAVE_PLAN_BUTTON = "btn-save-plan";
  private readonly SAVE_SUCCESS_MESSAGE = "plan-saved-success";

  /**
   * Navigate to itinerary view page
   */
  async goto() {
    await super.goto("/plans/view");
  }

  /**
   * Verify itinerary page is loaded
   */
  async verifyItineraryLoaded() {
    await this.waitForTestId(this.ITINERARY_VIEW);
  }

  /**
   * Check if itinerary view is visible
   */
  async isItineraryVisible(): Promise<boolean> {
    return this.isTestIdVisible(this.ITINERARY_VIEW);
  }

  /**
   * Check if save button is visible
   */
  async isSaveButtonVisible(): Promise<boolean> {
    return this.isTestIdVisible(this.SAVE_PLAN_BUTTON);
  }

  /**
   * Click the save plan button
   */
  async clickSavePlan() {
    await this.clickByTestId(this.SAVE_PLAN_BUTTON);
  }

  /**
   * Get the save plan button element
   */
  getSaveButton() {
    return this.getByTestId(this.SAVE_PLAN_BUTTON);
  }

  /**
   * Wait for save success message to appear
   */
  async waitForSaveSuccess(timeout = 5000) {
    await this.waitForTestId(this.SAVE_SUCCESS_MESSAGE, timeout);
  }

  /**
   * Check if save success message is visible
   */
  async isSaveSuccessVisible(): Promise<boolean> {
    return this.isTestIdVisible(this.SAVE_SUCCESS_MESSAGE);
  }

  /**
   * Get the success message element for assertions
   */
  getSuccessMessage() {
    return this.getByTestId(this.SAVE_SUCCESS_MESSAGE);
  }

  /**
   * Get the text content of success message
   */
  async getSuccessMessageText(): Promise<string> {
    return this.getTestIdText(this.SAVE_SUCCESS_MESSAGE);
  }

  /**
   * Complete the save plan workflow
   */
  async savePlan() {
    await this.waitForTestId(this.SAVE_PLAN_BUTTON);
    await this.clickSavePlan();
    await this.waitForSaveSuccess();
  }
}
