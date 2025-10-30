# View Implementation Plan: Dashboard ("My Plans")

## 1. Overview

This document outlines the implementation plan for the user Dashboard, which serves as the primary landing page for authenticated users. The view will display a list of the user's saved travel plans, provide a way to create new plans, and show an empty state for new users. It will feature infinite scrolling for plan pagination and skeleton loaders to improve perceived performance.

## 2. View Routing

- **Path**: `/dashboard`
- **Page Component**: `src/pages/dashboard.astro`

## 3. Component Structure

The view will be composed of an Astro page that renders a main client-side React component.

```
src/pages/dashboard.astro
src/components/dashboard/DashboardView.tsx
src/components/ui/Button.tsx ("Create New Plan")
src/components/dashboard/SkeletonLoader.tsx
src/components/dashboard/EmptyState.tsx
src/components/dashboard/PlanList.tsx
src/components/dashboard/PlanCard.tsx
```

## 4. Component Details

### `DashboardPage` (`src/pages/dashboard.astro`)

- **Component Description**: The server-side Astro page for the `/dashboard` route. It will be responsible for page layout and rendering the main React component. It should also handle authentication checks.
- **Main Elements**:
  - `Layout.astro` for the main page structure.
  - The `<DashboardView />` React component, loaded with `client:load`.
- **Handled Interactions**: None (server-side).
- **Handled Validation**:
  - Verifies if the user is authenticated. If not, redirects to the login page. (This logic will be commented out and marked with a `// TODO: Implement authentication check`).
- **Types**: None.
- **Props**: None.

### `DashboardView` (`src/components/dashboard/DashboardView.tsx`)

- **Component Description**: The primary client-side React component. It manages all state and logic for fetching, displaying, and paginating the user's plans. It orchestrates the rendering of loaders, the empty state, or the list of plans.
- **Main Elements**:
  - A `header` section with the title "My Plans" and the "Create New Plan" `Button`.
  - Conditional rendering logic to display one of: `SkeletonLoader`, `EmptyState`, or `PlanList`.
- **Handled Interactions**:
  - Fetches initial plan data and city data on component mount.
  - Handles the click event on the "Create New Plan" button to navigate to the plan creation wizard.
  - Triggers the loading of more plans for infinite scroll.
- **Handled Validation**: None.
- **Types**: `PlanViewModel`, `CityDto`.
- **Props**: None.

### `PlanList` (`src/components/dashboard/PlanList.tsx`)

- **Component Description**: Renders the grid of `PlanCard` components and manages the trigger for infinite scrolling.
- **Main Elements**:
  - A `div` or `ul` that maps over the `plans` array to render `PlanCard` components.
  - A sentinel `div` at the bottom of the list to be observed for triggering infinite scroll.
- **Handled Interactions**:
  - Detects when the sentinel element is visible on screen to trigger the `onLoadMore` callback.
- **Handled Validation**: None.
- **Types**: `PlanViewModel[]`.
- **Props**:
  - `plans: PlanViewModel[]`: The list of plans to display.
  - `onLoadMore: () => void`: A function to call when more plans should be loaded.
  - `isFetchingMore: boolean`: A flag to display a loading spinner at the bottom of the list.

### `PlanCard` (`src/components/dashboard/PlanCard.tsx`)

- **Component Description**: A card that displays a summary of a single travel plan. The entire card is a clickable link to the plan's detail page.
- **Main Elements**:
  - An `<a>` tag wrapping the card content, linking to `/plans/{plan.id}`.
  - Elements to display the city name, trip duration (e.g., "3 Day Trip"), and creation date.
- **Handled Interactions**:
  - Handles clicks to navigate the user to the corresponding plan detail page.
- **Handled Validation**: None.
- **Types**: `PlanViewModel`.
- **Props**:
  - `plan: PlanViewModel`: The plan data to display.

### `EmptyState` (`src/components/dashboard/EmptyState.tsx`)

- **Component Description**: A component displayed when the user has no saved plans. It should guide them to create one.
- **Main Elements**:
  - A graphic or icon (`EmptyStateGraphic`).
  - A heading like "No plans yet".
  - A descriptive text encouraging plan creation.
  - A "Create New Plan" `Button`.
- **Handled Interactions**: Handles the click on the "Create New Plan" button.
- **Handled Validation**: None.
- **Types**: None.
- **Props**: None.

### `SkeletonLoader` (`src/components/dashboard/SkeletonLoader.tsx`)

- **Component Description**: A placeholder that mimics the structure of the `PlanList`, shown during the initial data fetch to improve perceived performance.
- **Main Elements**:
  - A series of placeholder shapes with a shimmering animation that resemble the `PlanCard` layout.
- **Handled Interactions**: None.
- **Handled Validation**: None.
- **Types**: None.
- **Props**: None.

## 5. Types

### DTOs (from API)

- **`PlanDto`**: Used for each plan object in the `GET /api/plans` response.
- **`CityDto`**: Used for each city object from a `GET /api/cities` endpoint.
- **`ListPlansResponseDto`**: The response shape for the `GET /api/plans` API call.

### ViewModels (New types for the frontend)

- **`PlanViewModel`**: A custom type created to aggregate data for the UI, making components simpler.
  ```typescript
  export interface PlanViewModel {
    id: string; // Plan's unique ID
    cityName: string; // Name of the city (from a lookup)
    durationDays: number; // Duration of the trip
    displayDuration: string; // Formatted string, e.g., "3 Day Trip"
    displayCreatedAt: string; // Formatted creation date, e.g., "Created on Oct 24, 2025"
    // ... other fields from PlanDto as needed
  }
  ```

## 6. State Management

State will be managed within the `DashboardView.tsx` component, potentially extracted into a custom `usePlans` hook for better separation of concerns.

- **`usePlans` Custom Hook**:
  - **Purpose**: To encapsulate all data fetching, state management, and business logic related to plans.
  - **State Variables**:
    - `plans: PlanViewModel[]`: The accumulated list of plans.
    - `isLoading: boolean`: For the initial page load.
    - `isFetchingMore: boolean`: For subsequent page loads (infinite scroll).
    - `error: string | null`: For API error messages.
    - `page: number`: The current page to fetch.
    - `hasMore: boolean`: A flag to indicate if more plans are available to fetch.
  - **Exposed API**:
    - `plans`, `isLoading`, `isFetchingMore`, `error`, `hasMore`.
    - `loadMore()`: A function to trigger fetching the next page.

## 7. API Integration

The view will interact with two API endpoints. API call logic should be placed in a dedicated service/client file (e.g., `src/lib/api-client.ts`).

- **`GET /api/cities`**:
  - **Purpose**: To fetch all cities to map `city_id` from `PlanDto` to a `cityName` for the `PlanViewModel`.
  - **Timing**: Called once when the `usePlans` hook initializes.
  - **Response Type**: `Promise<CityDto[]>`

- **`GET /api/plans`**:
  - **Purpose**: To fetch the paginated list of user plans.
  - **Timing**: Called on initial load and every time `loadMore()` is triggered.
  - **Request Type**: The function will take `page` and `pageSize` as arguments.
  - **Response Type**: `Promise<ListPlansResponseDto>`

## 8. User Interactions

- **Page Load**: The user navigates to `/dashboard`. The `SkeletonLoader` is displayed while the first page of plans and city data are fetched.
- **Scrolling**: As the user scrolls down, a sentinel element at the bottom of the `PlanList` becomes visible, triggering the `loadMore` function to fetch and append the next page of plans.
- **Clicking "Create New Plan"**: The user is navigated to the plan creation wizard (e.g., `/create-plan`).
- **Clicking a Plan Card**: The user is navigated to the detail page for that specific plan (e.g., `/plans/some-uuid`).

## 9. Conditions and Validation

- **Authentication**: The primary condition is that the user must be authenticated. This will be checked in `dashboard.astro`. API calls returning `401 Unauthorized` will trigger a redirect to the login page.
- **Empty State**: If the initial API call for plans returns an empty array, the `EmptyState` component is rendered instead of the `PlanList`.
- **Infinite Scroll Termination**: The `hasMore` state variable will be set to `false` when an API call returns fewer plans than the page size, preventing further API calls on scroll.

## 10. Error Handling

- **API Failure**: If any API call fails (e.g., returns a 5xx status code), the `error` state in the `usePlans` hook will be set. The `DashboardView` will display a user-friendly error message (e.g., "Failed to load plans. Please try again.") and potentially a retry button.
- **Unauthorized Access**: If an API call returns a `401` status, the application will redirect the user to the login page. This will be a global handler in the API client. (Marked with `// TODO: Implement auth redirect`).

## 11. Implementation Steps

1. **Create Component Files**: Create the file structure and placeholder components: `dashboard.astro`, `DashboardView.tsx`, `PlanList.tsx`, `PlanCard.tsx`, `EmptyState.tsx`, and `SkeletonLoader.tsx`.
2. **Setup Dashboard Page**: Implement `src/pages/dashboard.astro` to include the `Layout` and render the `<DashboardView client:load />` component. Add a `TODO` for the authentication check.
3. **Define Types**: Create the `PlanViewModel` interface in a relevant types file (e.g., `src/components/dashboard/types.ts`).
4. **Implement API Client Functions**: Create functions to call `GET /api/cities` and `GET /api/plans`. These should handle requests and responses, including error handling.
5. **Develop `usePlans` Hook**: Implement the custom hook to manage state and encapsulate all data-fetching logic. It should fetch cities and the first page of plans initially.
6. **Build `DashboardView`**: Use the `usePlans` hook in `DashboardView.tsx`. Implement the conditional rendering logic for `SkeletonLoader`, `EmptyState`, and `PlanList` based on the hook's state.
7. **Build `PlanCard` and `PlanList`**: Implement the `PlanCard` to display `PlanViewModel` data and link to the detail page. Implement `PlanList` to render the cards and include the intersection observer logic for infinite scroll.
8. **Style Components**: Apply Tailwind CSS to all new components to match the application's design system.
9. **Finalize Integration**: Connect all components, ensure props are passed correctly, and test the full user flow from loading to scrolling to error states.
10. **Add Navigation**: Add a link to "/dashboard" in the application's main header/navigation for easy access.
