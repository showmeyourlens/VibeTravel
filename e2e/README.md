# E2E Tests with Playwright

This directory contains end-to-end tests for VibeTravel using Playwright with the Page Object Model (POM) pattern.

## Directory Structure

```
e2e/
├── page-objects/          # Page Object Model classes
│   ├── BasePage.ts        # Base class with common functionality
│   ├── DashboardPage.ts   # Dashboard page object
│   ├── PlanWizardPage.ts  # Plan wizard page object
│   ├── PlanGenerationPage.ts # Plan generation overlay handler
│   ├── ItineraryPage.ts   # Itinerary view page object
│   └── index.ts           # Centralized exports
├── utils/
│   ├── test-helpers.ts    # Common test utilities and helpers
│   └── database-cleanup.ts # Database cleanup utilities for teardown
├── global-teardown.ts     # Global teardown hook entry point
├── plan-creation.spec.ts  # Main E2E test suite
└── README.md             # This file
```

## Page Objects Overview

### BasePage

Base class providing common functionality for all page objects:

- Navigation methods (`goto()`, `getCurrentUrl()`)
- Element interaction helpers (`clickByTestId()`, `fillByTestId()`, `getByTestId()`)
- Wait helpers (`waitForTestId()`, `waitForTestIdHidden()`, `isTestIdVisible()`)
- Text extraction (`getTestIdText()`)
- URL waiting (`waitForUrl()`)

### DashboardPage

Handles dashboard/home page interactions:

- Navigate to dashboard
- Click "Create New Plan" button
- Verify button visibility and enabled state
- Start plan creation workflow

**Key Elements:**

- `btn-create-new-plan` - Create plan button

### PlanWizardPage

Manages the multi-step plan creation wizard:

- Navigate to wizard
- Verify wizard is loaded
- Navigate between steps (back button)
- Select destination (any city)
- Select duration (1-5 days)
- Select intensity (half-day or full-day)
- Generate plan
- Complete full wizard flow

**Key Elements:**

- `plan-wizard` - Main wizard container
- `wizard-step-content` - Current step content
- `btn-back` - Back navigation button
- `btn-select-city-{cityId}` - City selection buttons
- `btn-select-duration-{days}` - Duration selection buttons
- `btn-select-intensity-{intensity}` - Intensity selection buttons
- `btn-generate-plan` - Generate plan button

### PlanGenerationPage

Handles the AI plan generation process:

- Wait for generation to start (loading overlay appears)
- Check generation status
- Wait for generation to complete (loading overlay disappears)
- Full generation flow (start + complete)

**Key Elements:**

- `loading-overlay` - Loading overlay element

### ItineraryPage

Manages the itinerary view after plan generation:

- Navigate to itinerary page
- Verify itinerary is loaded
- Save plan
- Wait for save success message
- Get success message text
- Complete save workflow

**Key Elements:**

- `itinerary-view` - Main itinerary container
- `btn-save-plan` - Save plan button
- `plan-saved-success` - Success message

## Running Tests

### Run all tests

```bash
npm run test:e2e
```

### Run specific test file

```bash
npm run test:e2e -- plan-creation.spec.ts
```

### Run tests in headed mode (see browser)

```bash
npm run test:e2e -- --headed
```

### Run tests with debug mode

```bash
npm run test:e2e -- --debug
```

### Run tests in UI mode (interactive)

```bash
npm run test:e2e -- --ui
```

### Generate test code (codegen)

```bash
npx playwright codegen http://localhost:4321
```

## Test Examples

### Basic Plan Creation Test

```typescript
test("should complete full plan creation and save workflow", async () => {
  // ARRANGE
  await dashboardPage.navigateToDashboard();

  // ACT
  await dashboardPage.clickCreateNewPlan();
  await wizardPage.verifyWizardLoaded();
  await wizardPage.selectFirstAvailableCity();
  await wizardPage.selectDuration(2);
  await wizardPage.selectIntensity("half-day");
  await wizardPage.generatePlan();
  await generationPage.waitForFullGeneration();

  // ASSERT
  await expect(itineraryPage.getByTestId("itinerary-view")).toBeVisible();
  await itineraryPage.savePlan();
  await expect(itineraryPage.getSuccessMessage()).toBeVisible();
});
```

## Test Helpers

Common utility functions available in `utils/test-helpers.ts`:

- `waitForElementStable()` - Wait for element to stop changing
- `screenshotElement()` - Take screenshot of specific element
- `waitForMultipleTestIds()` - Wait for multiple elements
- `isElementEnabled()` / `isElementDisabled()` - Check element state
- `getElementAttribute()` - Get element attribute value
- `getMultipleElementsText()` - Get text from multiple elements
- `clickAndWaitForNavigation()` - Click and wait for page navigation
- `retryAction()` - Retry action with exponential backoff
- `waitForText()` - Wait for specific text to appear
- `getLocalStorageItem()` / `setLocalStorageItem()` - LocalStorage helpers
- `getSessionStorageItem()` - SessionStorage helpers
- `takeVisualSnapshot()` - Take visual comparison screenshot
- `logTest()` - Timestamped logging

## Writing New Tests

### Template

```typescript
import { test, expect } from "@playwright/test";
import { DashboardPage, PlanWizardPage, PlanGenerationPage, ItineraryPage } from "./page-objects";

test.describe("Feature Name", () => {
  let dashboardPage: DashboardPage;
  let wizardPage: PlanWizardPage;
  let generationPage: PlanGenerationPage;
  let itineraryPage: ItineraryPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    wizardPage = new PlanWizardPage(page);
    generationPage = new PlanGenerationPage(page);
    itineraryPage = new ItineraryPage(page);
  });

  test("should do something specific", async () => {
    // ARRANGE
    await dashboardPage.navigateToDashboard();

    // ACT
    await dashboardPage.clickCreateNewPlan();

    // ASSERT
    await expect(wizardPage.getByTestId("plan-wizard")).toBeVisible();
  });
});
```

## Best Practices

1. **Use Page Objects**: Always interact with pages through page objects, not directly with selectors
2. **Follow AAA Pattern**: Arrange, Act, Assert structure for clarity
3. **Use Test IDs**: Rely on `data-testid` attributes, not CSS classes or element positions
4. **Meaningful Names**: Use descriptive method names in page objects
5. **No Waits in Selectors**: Use explicit waits through page object methods
6. **Reuse Helpers**: Use test helpers for common operations
7. **Clear Assertions**: Make assertions specific and meaningful
8. **Handle Timeouts**: Set appropriate timeouts for AI operations (60s for generation)

## Debugging Tests

### View test report

```bash
npx playwright show-report
```

### View trace of failed test

```bash
npx playwright show-trace trace.zip
```

### Step through test in debugger

```bash
npx playwright test --debug
```

### Use UI mode for interactive debugging

```bash
npx playwright test --ui
```

## Database Cleanup

After all E2E tests complete, a global teardown hook automatically cleans up test-related data from the database.

### How It Works

1. **Global Teardown Hook**: Runs after all tests complete (`e2e/global-teardown.ts`)
2. **Authentication**: Uses test user credentials from environment variables
3. **Data Deletion**: Removes all plans and related activities created during tests
4. **RLS Security**: Leverages Supabase Row Level Security (RLS) to ensure only test user data is deleted
5. **No Service Key**: Uses public API key only - no server-side secrets needed

### Setup

Ensure these environment variables are configured in `.env.test`:

```
SUPABASE_TEST_URL=<your-test-supabase-url>
SUPABASE_PUBLIC_KEY=<your-public-supabase-key>
E2E_USERNAME=<test-user-email>
E2E_PASSWORD=<test-user-password>
```

### Data Cleanup Details

The cleanup process removes:

- All `plans` records created by the test user
- All `plan_activities` associated with deleted plans
- All `plan_feedback` associated with deleted plans

Cleanup occurs automatically after test run completes using Playwright's `globalTeardown` hook.

### Manual Cleanup

To manually clean up test data:

```typescript
import { cleanupTestData } from "./e2e/utils/database-cleanup";

await cleanupTestData("test-user@example.com", "password");
```

## Configuration

Tests are configured in `playwright.config.ts`:

- Base URL: `http://localhost:4321`
- Browser: Chromium (Desktop Chrome)
- Test directory: `./e2e`
- Timeout: 30 seconds per test
- Retries: 0 locally, 2 in CI
- Screenshots: On failure
- Traces: On first retry
- Global Teardown: `e2e/global-teardown.ts` - Runs after all tests to cleanup database

## CI/CD Integration

Tests run automatically in CI with:

- Single worker for consistency
- 2 retries on failure
- Trace collection for debugging
- HTML report generation

Local development uses parallel execution for speed.

## Test IDs Reference

Full reference of all test IDs used in the application is available in:

- `E2E_TEST_IDS_GUIDE.md` - Comprehensive guide with examples
- `E2E_TEST_IDS_QUICK_REFERENCE.md` - Quick lookup table

## Troubleshooting

### Test times out during generation

Increase timeout in `generationPage.waitForGenerationComplete(timeout)`:

```typescript
await generationPage.waitForGenerationComplete(90000); // 90 seconds
```

### Element not found

Verify the `data-testid` attribute exists on the component and matches the selector used in the test.

### Flaky tests

Use `waitForElementStable()` helper to ensure elements are ready:

```typescript
await waitForElementStable(page, "btn-save-plan");
```

### Visual differences

Use `--update-snapshots` flag to update baseline screenshots:

```bash
npx playwright test --update-snapshots
```

## Contributing

When adding new features:

1. Add `data-testid` attributes to components
2. Create or update page object methods
3. Add test cases covering the new feature
4. Update this README with new test IDs
5. Run tests locally before pushing: `npm run test:e2e`
