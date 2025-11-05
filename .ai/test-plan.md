

# VibeTravel - Comprehensive Test Plan

> **Document Status:** Enhanced & Updated  
> **Last Updated:** November 3, 2025  
> **Key Improvements:** Added visual regression testing, API contract testing, Astro-specific strategies, Supabase local dev, and refined coverage targets.

## 1. Executive Summary

### 1.1 Project Overview and Testing Objectives
VibeTravel is a web application designed to generate AI-powered travel itineraries. The core technology stack includes Astro, React, Tailwind CSS for the frontend, and Supabase for backend services (auth, database). The key feature is the AI-based itinerary generation, which uses Openrouter.ai.

The primary objectives of this test plan are to:
*   Ensure the reliability, security, and functionality of critical user workflows, including user authentication and travel plan generation/management.
*   Establish a robust testing foundation in a codebase that currently has no test coverage.
*   Mitigate risks associated with external dependencies (Supabase, Openrouter.ai) and complex user interactions.
*   Provide a clear roadmap for implementing a multi-layered testing strategy.

### 1.2 Risk Assessment
The analysis of the codebase reveals several key risk areas:
*   **No Existing Test Coverage:** The absence of any automated tests means there is no safety net to catch regressions. This is the highest-priority risk to mitigate.
*   **External AI Dependency:** The `ItineraryService` relies on Openrouter.ai. This external API can be a source of unpredictability, latency, and potential failures. Its responses must be validated.
*   **Authentication & Authorization:** As with any application with user accounts, ensuring the security of the authentication flow (managed by middleware and Supabase) is critical to protect user data.
*   **Data Integrity:** Travel plans created and saved by users are the core asset of the application. The integrity of data validation (handled by Zod schemas) and database operations must be verified.

### 1.3 Recommended Testing Strategy & Timeline
A layered testing approach is recommended, starting with the most critical components and expanding outward.

*   **Phase 1 - Foundation (Weeks 1-2):** Set up testing infrastructure including Vitest, Playwright, MSW, and Supabase Local Dev. Implement unit tests for all Zod schemas. Begin integration and API contract testing for authentication endpoints.
*   **Phase 2 - Core Features (Weeks 3-4):** Write component tests for all forms using React Testing Library + User Event. Develop integration tests for plan APIs. Build critical-path E2E tests. Set up visual regression testing with Playwright screenshots.
*   **Phase 3 - Comprehensive Coverage (Weeks 5-6):** Expand E2E tests to cover all major user journeys. Implement Astro-specific tests. Increase coverage to 70% target. Add CI/CD enhancements with coverage reporting and visual regression comparison.
*   **Phase 4 - Advanced Testing (Month 3+):** Introduce performance testing and benchmarking. Conduct security audits. Work toward 80% coverage maturity.

## 2. Test Strategy by Layer

### 2.1 Unit Tests
**Objective:** Verify that individual functions, components, and modules work correctly in isolation.
**Scope:**
*   **Zod Schemas (`src/lib/schemas/*.ts`):** Test all schemas with both valid and invalid data to ensure validation logic is correct. This is high-value and easy to implement.
*   **React Components (`src/components/**/*.tsx`):** Test components in isolation. For example, in `LoginForm.tsx`, test that validation errors appear when inputs are invalid and that the form's state changes correctly. UI rendering, props handling, and event handlers should be covered.
*   **Utility Functions (`src/lib/utils/*.ts`):** Any complex data transformation or utility functions should have dedicated unit tests.

### 2.2 Integration Tests
**Objective:** Test the interaction between different parts of the application.
**Scope:**
*   **API Endpoints (`src/pages/api/**/*.ts`):** These are the most critical integration points. Tests should simulate HTTP requests to endpoints like `POST /api/plans/generate` and verify the responses. This involves mocking the Supabase client and any external services like `ItineraryService`'s AI client.
*   **Component Interactions:** Test how components work together. For example, test the `PlanWizard`'s multi-step flow, ensuring state is passed correctly between steps.
*   **Service Layer (`src/pages/api/services/*.service.ts`):** Test services like `ItineraryService` by mocking database calls (`supabase`) and AI calls (`ai-client`) to verify the business logic within the service.

### 2.3 End-to-End (E2E) Tests
**Objective:** Simulate real user journeys through the entire application stack, from the UI to the database.
**Scope:**
*   **Authentication Flow:** User signs up -> confirms account -> logs in -> accesses a protected route -> logs out.
*   **Password Management:** User requests a password reset -> receives link (mocked) -> updates password -> logs in with new password.
*   **Critical Path - Plan Creation:** User logs in -> navigates to the new plan wizard -> fills out all steps -> generates an itinerary -> views the generated plan -> saves the plan.
*   **Plan Management:** User logs in -> navigates to the dashboard -> views their list of saved plans -> clicks on a plan to view its details.

### 2.4 Visual Regression Tests
**Objective:** Automatically detect unintended UI/CSS changes across the application.
**Scope:**
*   **Critical Pages:** Login page, signup page, plan wizard steps, generated itinerary view, dashboard.
*   **Responsive Testing:** Test key breakpoints (mobile, tablet, desktop) for critical pages.
*   **Component States:** Test different states (loading, error, empty, populated) of key components like `PlanCard`, `ActivityList`.
**Implementation:** Use Playwright's screenshot comparison (`expect(page).toHaveScreenshot()`) to capture and compare visual snapshots.

### 2.5 Astro-Specific Testing Strategy
**Objective:** Address the unique testing needs of Astro components and server-side rendering.
**Scope:**
*   **Astro Components (`.astro` files):** Most Astro components are static and server-rendered. Test these primarily through E2E tests rather than isolated unit tests.
*   **React Islands:** Use React Testing Library for dynamic React components (`.tsx` files) embedded in Astro pages.
*   **API Routes:** Test Astro API endpoints (`src/pages/api/**/*.ts`) using integration tests with supertest-like approaches via Vitest.
*   **Middleware:** Test `src/middleware/index.ts` by simulating requests with different authentication states.

### 2.6 API Contract Tests
**Objective:** Ensure backend APIs match frontend expectations and maintain contract integrity.
**Scope:**
*   **Schema Validation:** Verify that all API responses match their corresponding Zod schemas (`src/lib/schemas/*.ts`).
*   **Request/Response Contracts:** Test that API endpoints accept expected inputs and return data in the correct shape.
*   **Type Safety:** Leverage TypeScript and Zod to catch contract violations at compile time and runtime.

### 2.7 Performance Tests
**Objective:** To be considered after initial functional testing is mature.
**Scope:**
*   **API Endpoint Benchmarking:** Measure the response time of key API endpoints, especially `/api/plans/generate`, which depends on an external AI service.
*   **Frontend Load Time:** Use tools like Lighthouse to analyze page load performance.

### 2.8 Security Tests
**Objective:** Identify and mitigate security vulnerabilities.
**Scope:**
*   **Authorization:** Verify that the middleware (`src/middleware/index.ts`) correctly protects routes. Attempt to access protected endpoints without authentication and assert failure.
*   **Input Validation:** While Zod schemas provide a strong foundation, penetration testing (manual or automated) should be considered to check for common vulnerabilities like XSS in fields like `user_notes`.
*   **Dependency Scanning:** Integrate a tool like `npm audit` or Snyk into the CI/CD pipeline to check for vulnerabilities in third-party packages.

## 3. Detailed Test Cases (Examples)

| ID | Description | Priority | Prerequisites | Steps | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UNIT-001** | **Validate `generateRequestSchema`** | Critical | Test environment set up | 1. Import `generateRequestSchema`. <br> 2. Pass a valid request object. <br> 3. Pass an object with `duration_days` > 5. <br> 4. Pass an object with an invalid `city_id` UUID. <br> 5. Pass an object with invalid `trip_intensity`. | 1. Schema parsing succeeds. <br> 2. Schema parsing fails with a relevant error message. <br> 3. Schema parsing fails with a relevant error message. <br> 4. Schema parsing fails with a relevant error message. |
| **COMP-001** | **`LoginForm` shows validation errors** | High | Test runner with DOM environment (e.g., Vitest + JSDOM) | 1. Render `LoginForm` component. <br> 2. Click the "Log In" button without entering data. <br> 3. Enter an invalid email format. <br> 4. Enter a valid email but no password. | 1. "Email is required" and "Password is required" messages appear. <br> 2. "Please enter a valid email address" message appears. <br> 3. "Password is required" message appears. |
| **INT-001** | **`POST /api/plans/generate` validation** | Critical | Mock server for API requests | 1. Mock an authenticated user in `locals.user`. <br> 2. Send a `POST` request to `/api/plans/generate` with an empty body. <br> 3. Send a request with a valid body but mock the `ItineraryService` to throw a "City not found" error. | 1. Receive a 400 Bad Request response with a JSON parsing error. <br> 2. Receive a 404 Not Found response with the "City not found" message. |
| **E2E-001** | **User successfully logs in and is redirected** | Critical | A test user exists in the test database. | 1. Navigate to `/login`. <br> 2. Fill in the email and password for the test user. <br> 3. Click "Log In". | 1. User is redirected to the dashboard (homepage `/`). <br> 2. The page shows content for a logged-in user (e.g., a "Dashboard" or "My Plans" link). |
| **E2E-002** | **Unauthorized user is redirected from protected route** | Critical | No user is logged in. | 1. Navigate directly to `/plans/new`. | 1. User is redirected to `/login`. <br> 2. The URL changes to `/login`. |
| **VIS-001** | **Login page visual snapshot** | Medium | Playwright configured with screenshot testing | 1. Navigate to `/login`. <br> 2. Take screenshot at desktop (1920x1080), tablet (768x1024), and mobile (375x667) viewports. <br> 3. Compare against baseline. | 1. No visual regressions detected across all viewports. |
| **VIS-002** | **Plan wizard steps remain consistent** | Medium | Baseline screenshots exist | 1. Navigate through all wizard steps (`/plans/new`). <br> 2. Take screenshots of each step. <br> 3. Compare against baseline. | 1. UI remains consistent with baseline for all steps. |
| **CONTRACT-001** | **`POST /api/plans/generate` response schema** | High | Integration test environment | 1. Mock successful AI response. <br> 2. Call endpoint with valid input. <br> 3. Validate response against `generateResponseSchema`. | 1. Response passes Zod schema validation. <br> 2. All required fields are present and correctly typed. |
| **CONTRACT-002** | **`GET /api/plans` response schema** | High | Test database with sample data | 1. Seed test database with plans. <br> 2. Call endpoint as authenticated user. <br> 3. Validate each plan object matches expected schema. | 1. All plan objects pass schema validation. <br> 2. Array structure is correct. |

## 4. Testing Infrastructure

*   **Testing Frameworks:**
    *   **Unit/Integration:** **Vitest**. It's fast, compatible with Vite (which Astro uses), and has a Jest-compatible API. Perfect fit for Astro 5 projects.
    *   **Component:** **React Testing Library** (with Vitest) + **@testing-library/user-event**. For testing React components from a user's perspective with realistic user interactions.
    *   **E2E:** **Playwright**. Offers robust cross-browser testing, auto-waits, excellent debugging tools, and built-in visual regression testing capabilities.
    *   **Visual Regression:** **Playwright Screenshots**. For catching CSS/layout regressions automatically on critical pages.
*   **CI/CD Pipeline Integration:**
    *   In GitHub Actions, create a new workflow that triggers on every push to `main` and on pull requests.
    *   This workflow should have stages for:
        1.  Installing dependencies (`npm ci`).
        2.  Running linters (`npm run lint`).
        3.  Running all tests (`npm test`).
        4.  (Optional) Building the application to catch build errors.
*   **Test Environment:**
    *   Use **Supabase Local Development** (`npx supabase start`) for integration and E2E tests. This provides a local Postgres database with Auth, eliminating the need for a separate cloud project.
    *   Benefits: Faster, cheaper, more reliable, easy to reset between tests, and provides true database testing without complex mocking.
    *   Environment variables for local Supabase and test services should be managed using repository secrets in GitHub Actions.
*   **Mocking/Stubbing Strategy:**
    *   **External APIs (Openrouter.ai):** Use **Mock Service Worker (MSW)**. It can intercept outgoing `fetch` requests on both the client and server (`@astrojs/node`), allowing you to return canned responses without hitting the actual API. This is crucial for reliable and fast tests of the `ItineraryService`.
    *   **Service Layer Mocking:** Mock at service boundaries (e.g., `ItineraryService`, `PlanService`) rather than the entire Supabase client. This provides cleaner, more maintainable tests.
    *   **Database Testing:** Use Supabase Local Dev for integration tests with actual database operations. Only mock when isolation is necessary (unit tests).
*   **Test Data Management:**
    *   Create a **seeding script** (`supabase/seed.sql` can be expanded or a separate script created) to populate the test database with consistent data before E2E tests run (e.g., create a default test user, sample cities).
    *   E2E tests should clean up any data they create to ensure tests are idempotent.

## 5. Coverage Metrics

*   **Current Test Coverage:** 0%.
*   **Target Coverage Percentages (Line Coverage):**
    *   **Phase 1 (Initial Target):** **70% overall coverage** - Focus on quality over quantity
    *   **Phase 2 (Mature Target):** **80% overall coverage**
    *   **Critical Priority** (Auth, Plan Generation, Data Schemas): **85%+**
    *   **High Priority** (Plan Management, API endpoints): **75%+**
    *   **Medium Priority** (Secondary UI components, non-critical flows): **60%**
    *   **Low Priority** (Static content, cosmetic elements): Not a primary focus.
*   **Coverage Philosophy:** Prioritize testing business logic and user-facing behavior over implementation details. Avoid testing for the sake of arbitrary coverage numbers.
*   **Coverage Gaps & Remediation:** The entire codebase is the current gap. This test plan serves as the remediation strategy. Coverage will be tracked using Vitest's built-in coverage reporting tools and monitored in CI/CD.

## 6. Risk Matrix

| Risk Area | Description | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **AI Itinerary Generation Failure** | The external Openrouter.ai API is down, slow, or returns malformed data, breaking the core feature. | Medium | Critical | Implement robust error handling, response validation (`generateResponseSchema`), and circuit breakers. Use MSW to mock this dependency heavily in integration and E2E tests. |
| **Authentication Bypass** | A flaw in the middleware or Supabase configuration allows unauthorized access to user data. | Low | Critical | Write extensive E2E and integration tests that explicitly try to access protected resources without valid sessions. Regular security audits. |
| **Data Corruption** | Invalid data is saved to the database due to faulty client-side or server-side validation. | Medium | High | Enforce Zod schema validation at the API boundary for all CUD (Create, Update, Delete) operations. Write unit tests for all schemas. |
| **No Test Coverage** | A bug is introduced and deployed to production because no automated tests exist to catch the regression. | High | High | Implement this test plan, starting with the critical path E2E tests and integration tests for APIs. Enforce test runs in a pre-merge CI check. |

## 7. Implementation Roadmap

### Phase 1: Foundational Setup & Critical Tests (Weeks 1-2)
1.  **Infrastructure:**
    *   Install and configure Vitest, React Testing Library, `@testing-library/user-event`, and Playwright.
    *   Set up `npm` scripts for running tests (`test`, `test:unit`, `test:e2e`, `test:coverage`).
    *   Set up **Supabase Local Development** (`npx supabase init` and `npx supabase start`).
    *   Configure MSW (Mock Service Worker) for API mocking.
    *   Set up a basic CI workflow in GitHub Actions to run on PRs.
2.  **Unit Tests:**
    *   Write unit tests for all Zod schemas in `src/lib/schemas`.
    *   Test middleware authentication logic.
3.  **API Contract Tests:**
    *   Validate API responses against Zod schemas for critical endpoints.
4.  **Integration Tests:**
    *   Write integration tests for the authentication API endpoints (`/api/auth/login`, `/api/auth/signup`).

### Phase 2: High-Priority Features (Weeks 3-4)
1.  **Component Tests:**
    *   Write component tests for `LoginForm`, `SignupForm`, and `ForgotPasswordForm` using React Testing Library + User Event.
    *   Begin testing the `PlanWizard` components with multi-step flow validation.
2.  **Integration Tests:**
    *   Write integration tests for all `/api/plans` endpoints using Supabase Local Dev.
    *   Mock external services (Openrouter.ai) using MSW.
3.  **API Contract Tests:**
    *   Expand contract tests to cover all plan-related endpoints.
4.  **E2E Tests:**
    *   Implement the critical path E2E test: Login -> Create Plan -> View Plan.
    *   Implement the authentication E2E tests: Unauthorized access, Login/Logout flow.
5.  **Visual Regression Tests:**
    *   Set up Playwright screenshot testing for critical pages (login, signup, dashboard).
    *   Create baseline screenshots for all major UI states.

### Phase 3: Comprehensive Coverage & Maintenance (Weeks 5-6+)
1.  **Expand Coverage:**
    *   Increase test coverage across all layers to meet the 70% initial target.
    *   Write E2E tests for secondary features like plan saving, dashboard viewing, and password reset.
    *   Expand visual regression tests to include responsive breakpoints and component states.
2.  **Astro-Specific Testing:**
    *   Implement integration tests for Astro middleware and server-side rendering.
    *   Test React islands embedded in Astro pages.
3.  **CI/CD Enhancement:**
    *   Add test coverage reporting to the CI pipeline with visual badges.
    *   Implement PR checks that warn if coverage decreases significantly.
    *   Add visual regression test comparison in CI.
4.  **Maintenance:**
    *   All new features and bug fixes must be accompanied by relevant tests.
    *   The test suite should be reviewed and refactored periodically.
    *   Update baseline screenshots when intentional UI changes are made.

### Phase 4: Advanced Testing (Month 3+)
1.  **Performance Testing:**
    *   Implement API endpoint benchmarking for critical routes.
    *   Add Lighthouse CI for automated performance monitoring.
    *   Set performance budgets and SLAs based on baseline metrics.
2.  **Security Testing:**
    *   Conduct thorough security testing and penetration testing.
    *   Implement automated dependency vulnerability scanning.
3.  **Coverage Maturity:**
    *   Work toward 80% overall coverage target.
    *   Focus on edge cases and error scenarios.

---

## 8. Technology Stack Summary

### Confirmed Technology Choices
The following technologies are **confirmed optimal** for this Astro 5 + React 19 project:

| Technology | Purpose | Why It's the Right Choice |
| :--- | :--- | :--- |
| **Vitest** | Unit/Integration Testing | Perfect Vite/Astro integration, fast, Jest-compatible API |
| **React Testing Library** | Component Testing | Industry standard, user-centric testing approach |
| **@testing-library/user-event** | User Interaction Simulation | More realistic user interactions than RTL alone |
| **Playwright** | E2E Testing | Superior cross-browser support, built-in visual regression, excellent debugging |
| **Mock Service Worker (MSW)** | API Mocking | Works in both Node and browser, clean mocking separation |
| **Supabase Local Dev** | Test Database | Faster, cheaper, more reliable than separate cloud project |
| **Playwright Screenshots** | Visual Regression | Native integration, no additional tools needed |

### Key Improvements Over Initial Plan
1. **Supabase Local Development** replaces separate test project → Faster, simpler, more reliable
2. **Visual Regression Testing** added with Playwright → Catches UI/CSS regressions automatically
3. **API Contract Testing** added → Ensures backend/frontend alignment via Zod schemas
4. **Astro-Specific Testing Strategy** added → Addresses unique SSR and hybrid rendering needs
5. **Coverage targets adjusted** from 90% to 70%/80% phased approach → More realistic and achievable
6. **Performance testing** moved to Phase 4 → Proper prioritization after functional coverage
7. **User Event library** added → Better user interaction simulation in component tests

---

## Answers to Additional Context Questions

Based on the repository analysis, here are the answers to your questions:

*   **Are there specific compliance requirements (GDPR, HIPAA, PCI)?**
    *   This information is not present in the codebase or documentation. This must be clarified with project stakeholders as it has significant implications for data handling and testing.
*   **What is the deployment frequency and release cycle?**
    *   The presence of a `lint-staged` configuration and the recommendation for GitHub Actions in `tech-stack.md` suggest a modern CI/CD approach with potentially frequent deployments, but a specific cycle is not defined.
*   **Are there specific performance benchmarks or SLAs?**
    *   No performance benchmarks or Service Level Agreements (SLAs) are defined in the repository. These should be established, especially for the AI generation feature.
*   **What percentage of code coverage is the target?**
    *   **Phase 1 Target: 70% overall coverage** (pragmatic and achievable)
    *   **Phase 2 Target: 80% overall coverage** (mature coverage)
    *   Focus on quality over arbitrary numbers. See "Coverage Metrics" section for detailed breakdown.
*   **Are there any known issues or areas of concern?**
    *   The most significant known issue is the complete lack of automated testing, which this plan is designed to address. The dependency on an external AI service is the primary technical area of concern.