import { test, expect } from "@playwright/test";
import { LoginPage, DashboardPage, PlanWizardPage, PlanGenerationPage, ItineraryPage } from "./page-objects";

/**
 * E2E Test Suite: Plan Creation and Saving Flow
 *
 * This test suite covers the complete user journey:
 * 1. Login with credentials from .env.test
 * 2. Open dashboard
 * 3. Click generate plan button
 * 4. Select a city
 * 5. Select "2" days duration
 * 6. Select "half day" intensity
 * 7. Generate the plan
 * 8. Wait for plan to be generated
 * 9. Save the plan
 */

test.describe("Plan Creation E2E Flow", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let wizardPage: PlanWizardPage;
  let generationPage: PlanGenerationPage;
  let itineraryPage: ItineraryPage;

  test.beforeEach(async ({ page }) => {
    // Initialize all page objects
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    wizardPage = new PlanWizardPage(page);
    generationPage = new PlanGenerationPage(page);
    itineraryPage = new ItineraryPage(page);

    // Login before each test
    await loginPage.navigateToLogin();

    const email =
      process.env.E2E_USERNAME ??
      (() => {
        throw new Error("E2E_USERNAME is not set");
      })();
    const password =
      process.env.E2E_PASSWORD ??
      (() => {
        throw new Error("E2E_PASSWORD is not set");
      })();

    await loginPage.login(email, password);
    await loginPage.waitForLoginComplete();
  });

  test("should complete full plan creation and save workflow", async () => {
    // ARRANGE
    await dashboardPage.navigateToDashboard();

    // ACT - Step 1: Open dashboard (already done in ARRANGE)

    // ACT - Step 2: Click generate plan button
    await expect(dashboardPage.getByTestId("btn-create-new-plan")).toBeVisible();
    await dashboardPage.clickCreateNewPlan();

    // ACT - Verify wizard is loaded
    await wizardPage.verifyWizardLoaded();
    await expect(wizardPage.getStepContent()).toBeVisible();

    // ACT - Step 3: Select a city (any available city)
    await wizardPage.selectFirstAvailableCity();

    // ACT - Step 4: Select "2" days duration
    await wizardPage.selectDuration(2);

    // ACT - Step 5: Select "half day" intensity
    await wizardPage.selectIntensity("half-day");

    // ACT - Step 6: Generate plan
    await wizardPage.generatePlan();

    // ACT - Step 7: Wait for plan to be generated
    await generationPage.waitForFullGeneration();

    // ASSERT - Verify itinerary page is displayed
    await expect(itineraryPage.getByTestId("itinerary-view")).toBeVisible();

    // ACT - Step 8: Save the plan
    await itineraryPage.savePlan();

    // ASSERT - Verify save success message
    await expect(itineraryPage.getSuccessMessage()).toBeVisible();
    const successText = await itineraryPage.getSuccessMessageText();
    expect(successText).toContain("Plan saved successfully");
  });

  //   test("should select specific city (2 days, half-day)", async () => {
  //     // ARRANGE
  //     await dashboardPage.navigateToDashboard();

  //     // ACT
  //     await dashboardPage.clickCreateNewPlan();
  //     await wizardPage.verifyWizardLoaded();
  //     await wizardPage.selectFirstAvailableCity();
  //     await wizardPage.selectDuration(2);
  //     await wizardPage.selectIntensity("half-day");
  //     await wizardPage.generatePlan();

  //     // ACT - Wait for generation
  //     await generationPage.waitForFullGeneration();

  //     // ASSERT
  //     await expect(itineraryPage.getByTestId("itinerary-view")).toBeVisible();
  //   });

  //   test("should display loading overlay during plan generation", async () => {
  //     // ARRANGE
  //     await dashboardPage.navigateToDashboard();
  //     await dashboardPage.clickCreateNewPlan();
  //     await wizardPage.verifyWizardLoaded();

  //     // ACT
  //     await wizardPage.selectFirstAvailableCity();
  //     await wizardPage.selectDuration(2);
  //     await wizardPage.selectIntensity("half-day");
  //     await wizardPage.generatePlan();

  //     // ASSERT - Loading overlay appears
  //     await expect(generationPage.getLoadingOverlay()).toBeVisible();

  //     // ASSERT - Loading overlay eventually disappears
  //     await generationPage.waitForGenerationComplete();
  //     await expect(generationPage.getLoadingOverlay()).not.toBeVisible();
  //   });

  //   test("should save generated plan successfully", async () => {
  //     // ARRANGE
  //     await dashboardPage.navigateToDashboard();
  //     await dashboardPage.clickCreateNewPlan();
  //     await wizardPage.verifyWizardLoaded();
  //     await wizardPage.completeWizardFlow("btn-select-city-0", 2, "half-day");
  //     await generationPage.waitForFullGeneration();

  //     // ACT
  //     await itineraryPage.verifyItineraryLoaded();
  //     await itineraryPage.clickSavePlan();

  //     // ASSERT
  //     const successMessage = itineraryPage.getSuccessMessage();
  //     await expect(successMessage).toBeVisible();
  //   });

  //   test("should navigate back in wizard steps", async () => {
  //     // ARRANGE
  //     await dashboardPage.navigateToDashboard();
  //     await dashboardPage.clickCreateNewPlan();
  //     await wizardPage.verifyWizardLoaded();

  //     // ACT - Select city (Step 1)
  //     await wizardPage.selectFirstAvailableCity();

  //     // ACT - Select duration (Step 2) - back button should now be visible
  //     await wizardPage.selectDuration(2);
  //     const isBackVisible = await wizardPage.isBackButtonVisible();

  //     // ASSERT
  //     expect(isBackVisible).toBe(true);

  //     // ACT - Click back to return to step 1
  //     await wizardPage.clickBack();

  //     // ASSERT - We should be back at destination step
  //     const stepContent = await wizardPage.getStepContent().textContent();
  //     expect(stepContent).toContain("Where do you want to go");
  //   });

  //   test("should allow selection of different durations", async () => {
  //     // ARRANGE
  //     await dashboardPage.navigateToDashboard();
  //     await dashboardPage.clickCreateNewPlan();
  //     await wizardPage.verifyWizardLoaded();

  //     // ACT & ASSERT - Test various durations
  //     for (let days = 1; days <= 5; days++) {
  //       await wizardPage.selectFirstAvailableCity();
  //       await wizardPage.selectDuration(days);
  //       await expect(wizardPage.getByTestId(`btn-select-duration-${days}`)).toBeFocused();
  //       await wizardPage.clickBack();
  //       await wizardPage.selectFirstAvailableCity();
  //     }
  //   });

  //   test("should allow selection of different intensities", async () => {
  //     // ARRANGE
  //     await dashboardPage.navigateToDashboard();
  //     await dashboardPage.clickCreateNewPlan();
  //     await wizardPage.verifyWizardLoaded();
  //     await wizardPage.selectFirstAvailableCity();
  //     await wizardPage.selectDuration(2);

  //     // ACT & ASSERT - Test half day intensity
  //     await wizardPage.selectIntensity("half-day");
  //     const halfDayBtn = wizardPage.getByTestId("btn-select-intensity-half-day");
  //     await expect(halfDayBtn).toBeFocused();

  //     // ACT & ASSERT - Switch to full day intensity
  //     await wizardPage.selectIntensity("full-day");
  //     const fullDayBtn = wizardPage.getByTestId("btn-select-intensity-full-day");
  //     await expect(fullDayBtn).toBeFocused();
  //   });
});
