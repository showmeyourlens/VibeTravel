import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Dashboard Page Object
 * Handles interactions with the dashboard/home page
 */
export class DashboardPage extends BasePage {
  // Test IDs for dashboard elements
  private readonly CREATE_PLAN_BUTTON = "btn-create-new-plan";

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to dashboard home page
   */
  async goto() {
    await super.goto("/");
  }

  /**
   * Click on "Create New Plan" button to start the plan wizard
   * Can be called from different states (empty state, plan list, loading)
   */
  async clickCreateNewPlan() {
    await this.clickByTestId(this.CREATE_PLAN_BUTTON);
  }

  /**
   * Check if "Create New Plan" button is visible
   */
  async isCreatePlanButtonVisible(): Promise<boolean> {
    return this.isTestIdVisible(this.CREATE_PLAN_BUTTON);
  }

  /**
   * Wait for the "Create New Plan" button to be enabled
   */
  async waitForCreatePlanButtonEnabled() {
    await this.page.getByTestId(this.CREATE_PLAN_BUTTON).isEnabled({ timeout: 5000 });
  }

  /**
   * Navigate to dashboard and verify page is loaded
   */
  async navigateToDashboard() {
    await this.goto();
    await this.waitForPageLoad();
  }

  /**
   * Start plan creation workflow
   */
  async startPlanCreation() {
    await this.waitForTestId(this.CREATE_PLAN_BUTTON);
    await this.clickCreateNewPlan();
    await this.waitForUrl("/plans/new");
  }
}

