# View Implementation Plan: Plan Wizard

## 1. Overview
The Plan Wizard view provides a step-by-step interface for users to input their travel preferences. It collects the destination, trip duration, intensity, and any specific notes. Upon completion, it submits this information to an AI service to generate a new travel plan. The view is designed to be user-friendly, guiding the user through the process and providing clear feedback and loading states.

## 2. View Routing
The view will be accessible at the following path: `/plans/new`. Access will be restricted to authenticated users.

## 3. Component Structure
The view will be built using a hierarchical component structure. The main `PlanWizard` component will manage state and render the appropriate step component based on user progress.

```
- pages/plans/new.astro
  - components/plan-wizard/PlanWizard.tsx (client:load)
    - components/plan-wizard/LoadingOverlay.tsx
    - components/plan-wizard/StepIndicator.tsx
    - (Conditional Rendering based on current step)
      - components/plan-wizard/StepDestination.tsx
      - components/plan-wizard/StepDuration.tsx
      - components/plan-wizard/StepIntensity.tsx
      - components/plan-wizard/StepNotes.tsx
    - (Wizard Navigation Buttons)
      - components/ui/Button.tsx (Back)
      - components/ui/Button.tsx (Next / Generate)
```

## 4. Component Details

### `PlanWizard.tsx`
- **Component description**: This is the main stateful container for the entire wizard. It manages the current step, all form data, and handles the API submission for plan generation. It orchestrates the rendering of child components for each step.
- **Main elements**: A main `div` container that conditionally renders the active step component (`StepDestination`, `StepDuration`, etc.), the `StepIndicator`, navigation `Button` components, and the `LoadingOverlay`.
- **Handled interactions**:
  - `handleNext`: Advances to the next step.
  - `handlePrev`: Returns to the previous step.
  - `handleSubmit`: Validates the final form data and calls the `POST /api/plans/generate` endpoint.
  - `updateFormData`: Receives data from child step components and updates the central state.
- **Handled validation**:
  - Disables the "Next" button until the current step's requirements are met.
  - Performs a final validation of the entire `PlanWizardViewModel` before submitting to the API.
- **Types**: `PlanWizardViewModel`, `GenerateDraftPlanRequestDTO`, `CityDto[]`.
- **Props**: None.

### `StepIndicator.tsx`
- **Component description**: A simple, presentational component that visually indicates the user's progress through the wizard (e.g., "Step 1 of 4").
- **Main elements**: `div` or `p` tags to display the step information.
- **Handled interactions**: None.
- **Handled validation**: None.
- **Types**: `number` (currentStep), `number` (totalSteps).
- **Props**: `{ currentStep: number; totalSteps: number; }`

### `StepDestination.tsx`
- **Component description**: The first step, allowing the user to select a destination city from a list fetched from the API.
- **Main elements**: Vertically-aligned, alphabetically ordered buttons representing cities.
- **Handled interactions**: `onClick` on the select element to capture the selected city ID.
- **Handled validation**: A city must be selected.
- **Types**: `CityDto[]`.
- **Props**: `{ cities: CityDto[]; selectedCityId: string | null; onSelect: (cityId: string) => void; }`

### `StepDuration.tsx`
- **Component description**: The second step, for selecting the trip duration between 1 and 5 days. It will be implemented as a carousel-like horizontal selector.
- **Main elements**: A set of styled `button` or `div` elements representing numbers 1 through 5.
- **Handled interactions**: `onClick` on a duration option to select it.
- **Handled validation**: A duration must be selected.
- **Types**: `number`.
- **Props**: `{ selectedDuration: number | null; onSelect: (duration: number) => void; }`

### `StepIntensity.tsx`
- **Component description**: The third step, for selecting the trip's intensity.
- **Main elements**: Two horizontally-aligned `Button` components for "Half Day" and "Full Day".
- **Handled interactions**: `onClick` or `onValueChange` to select an intensity.
- **Handled validation**: An intensity must be selected.
- **Types**: `"full day" | "half day"`.
- **Props**: `{ selectedIntensity: "full day" | "half day" | null; onSelect: (intensity: "full day" | "half day") => void; }`

### `StepNotes.tsx`
- **Component description**: The final step, providing a textarea for optional user notes.
- **Main elements**: A `label`, `textarea` and button `Generate!`.
- **Handled interactions**: `onChange` on the textarea to update the notes.
- **Handled validation**: None (field is optional).
- **Types**: `string`.
- **Props**: `{ notes: string; onChange: (notes: string) => void; }`

### `LoadingOverlay.tsx`
- **Component description**: A modal overlay that covers the screen to indicate a pending API request after the user submits the form.
- **Main elements**: A fixed-position `div` with a semi-transparent background, containing a spinner icon and a text label (e.g., "Generating your plan...").
- **Handled interactions**: None.
- **Handled validation**: None.
- **Types**: `boolean`.
- **Props**: `{ isVisible: boolean; }`

## 5. Types
- **`CityDto`**: `{ id: string; name: string; }` (from `types.ts`) - Represents a single city object fetched from the API.
- **`GenerateDraftPlanRequestDTO`**: (from `types.ts`) - The exact object structure required by the `POST /api/plans/generate` endpoint.
- **`GenerateDraftPlanResponseDTO`**: (from `types.ts`) - The expected success response from the generation endpoint.
- **`ErrorResponseDTO`**: `{ error: string; }` (from `types.ts`) - The structure for API error responses.
- **`PlanWizardViewModel` (New)**: A client-side ViewModel to hold the form state as the user progresses through the wizard.
  ```typescript
  interface PlanWizardViewModel {
    cityId: string | null;
    durationDays: number | null;
    tripIntensity: "full day" | "half day" | null;
    userNotes: string;
  }
  ```

## 6. State Management
State will be managed within the `PlanWizard.tsx` component, likely encapsulated within a custom hook, `usePlanWizard`, for better organization and separation of concerns.

- **`usePlanWizard` Hook**:
  - **Purpose**: To manage the wizard's state, step logic, data fetching, and form submission.
  - **State managed**:
    - `currentStep: number`: The current wizard step.
    - `formData: PlanWizardViewModel`: The user's inputs.
    - `cities: CityDto[]`: The list of available cities.
    - `isLoading: boolean`: The loading state for the API call.
    - `error: string | null`: API error messages.
  - **Functions exposed**:
    - `handleNext`, `handlePrev`: For navigation.
    - `updateFormData`: To update the state from step components.
    - `generatePlan`: To handle the final submission.

## 7. API Integration
- **`GET /api/cities`**:
  - **Trigger**: On initial mount of the `PlanWizard` component.
  - **Purpose**: To fetch the list of selectable destination cities.
  - **Response Type**: `CityDto[]`
- **`POST /api/plans/generate`**:
  - **Trigger**: On submission of the final step of the wizard.
  - **Purpose**: To generate the travel plan.
  - **Request Type**: `GenerateDraftPlanRequestDTO`
  - **Response Type**: `GenerateDraftPlanResponseDTO`

## 8. User Interactions
- **Loading View**: User navigates to `/plans/new`. The wizard appears at Step 1, and city data is fetched in the background.
- **Step Navigation**: User clicks "Next" to proceed or "Back" to return. The "Next" button is disabled if the current step is invalid.
- **Data Entry**: User selects options in each step. The selections are immediately reflected in the wizard's state.
- **Submission**: User clicks "Generate Plan" on the final step.
- **Loading State**: A full-screen loading overlay appears, preventing further interaction.
- **Success**: The user is redirected to a new page to view the generated plan. The plan data will be temporarily stored in `sessionStorage` to be retrieved by the new page.
- **Failure**: The loading overlay is removed, and an error message is displayed on the wizard page. The user can then modify their inputs and try again.

## 9. Conditions and Validation
- **`StepDestination`**: `cityId` cannot be `null`.
- **`StepDuration`**: `durationDays` cannot be `null`. The "Next" button is disabled until a duration is selected. The component will only allow values between 1 and 5.
- **`StepIntensity`**: `tripIntensity` cannot be `null`.
- **Final Submission**: All required fields (`cityId`, `durationDays`, `tripIntensity`) in the `PlanWizardViewModel` must be non-null before the API call to `POST /api/plans/generate` is made.

## 10. Error Handling
- **API Fetch Error (`GET /api/cities`)**: If fetching cities fails, an error message will be displayed in place of the wizard, preventing the user from proceeding.
- **Validation Error (`400 Bad Request`)**: The API response error message will be displayed to the user.
- **AI Generation Error (`422 Unprocessable Entity`)**: A user-friendly message such as "We couldn't generate a plan with these options. Please try adjusting them." will be displayed.
- **Server Error (`500 Internal Server Error`)**: A generic error message such as "An unexpected error occurred. Please try again later." will be displayed.
- **Authentication Error**: Users who are not logged in will be redirected to the login page by the application's middleware.

## 11. Implementation Steps
1.  Create a new Astro page at `src/pages/plans/new.astro`.
2.  Create a new directory `src/components/plan-wizard`.
3.  Implement the main `PlanWizard.tsx` component, setting up the basic state management for `currentStep` and `formData`.
4.  Implement the `usePlanWizard` custom hook to handle all state logic, including fetching cities using `useEffect`.
5.  Create the presentational components for each step: `StepIndicator.tsx`, `StepDestination.tsx`, `StepDuration.tsx`, `StepIntensity.tsx`, and `StepNotes.tsx`.
6.  Integrate the step components into `PlanWizard.tsx`, using conditional rendering based on `currentStep`.
7.  Implement the navigation logic (`handleNext`, `handlePrev`) and step-level validation (enabling/disabling the "Next" button).
8.  Implement the `LoadingOverlay.tsx` component and control its visibility with the `isLoading` state.
9.  Implement the `generatePlan` function to perform the `POST /api/plans/generate` API call, including request body creation and handling success, error, and loading states.
10. On a successful response, store the result in `sessionStorage` and programmatically redirect the user.
11. Add UI elements to display API error messages to the user.
12. Ensure the component is rendered with `client:load` in `new.astro` to make it interactive.
13. Add a link or button on the main dashboard page that navigates to `/plans/new`.
