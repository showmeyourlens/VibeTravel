import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Plan Generation Page Object
 * Handles interactions during the AI plan generation process
 */
export class PlanGenerationPage extends BasePage {
  // Test IDs for generation elements
  private readonly LOADING_OVERLAY = "loading-overlay";

  constructor(page: Page) {
    super(page);
  }

  /**
   * Wait for the loading overlay to appear (plan generation started)
   */
  async waitForGenerationStart(timeout = 10000) {
    await this.waitForTestId(this.LOADING_OVERLAY, timeout);
  }

  /**
   * Check if loading overlay is visible
   */
  async isGenerating(): Promise<boolean> {
    return this.isTestIdVisible(this.LOADING_OVERLAY);
  }

  /**
   * Wait for plan generation to complete (loading overlay disappears)
   * Default timeout is 60 seconds for AI generation
   */
  async waitForGenerationComplete(timeout = 60000) {
    await this.waitForTestIdHidden(this.LOADING_OVERLAY, timeout);
  }

  /**
   * Get the loading overlay element for visibility assertions
   */
  getLoadingOverlay() {
    return this.getByTestId(this.LOADING_OVERLAY);
  }

  /**
   * Complete the full generation flow:
   * 1. Wait for generation to start
   * 2. Wait for generation to complete
   */
  async waitForFullGeneration(timeout = 60000) {
    await this.waitForGenerationStart();
    await this.waitForGenerationComplete(timeout);
  }
}

