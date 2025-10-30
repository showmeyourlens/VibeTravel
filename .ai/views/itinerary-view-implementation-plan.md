# View Implementation Plan: Itinerary View

## 1. Overview

The Itinerary View serves as the primary interface for users to view and interact with their travel plans. It displays a detailed day-by-day breakdown of activities for a trip. For newly generated plans, it presents the initial AI-generated itinerary. For saved plans, it provides a read-only view that can be switched into an "edit mode," allowing users to reorder or delete activities to customize their plan. The view also integrates functionality for saving the finalized plan and collecting user feedback.

## 2. View Routing

The view will be accessible via the following Astro page route:

- **Path**: `src/pages/plans/[planId].astro`
- This route will handle both newly generated draft plans and existing saved plans.
  - For a **new draft plan**, the `planId` will be a special keyword, such as `draft`. The plan data will be retrieved from client-side state (e.g., Zustand store) populated by the plan generation wizard.
  - For a **saved plan**, `planId` will be the UUID of the plan. The page will fetch the plan data from the API based on this ID.

## 3. Component Structure

The view will be composed of a hierarchy of React components, orchestrated by a main container component.

```
/src/components/itinerary/
├── ItineraryView.tsx (Container)
│   ├── PlanMetadata.tsx
│   ├── DisclaimerBanner.tsx
│   ├── PlanActions.tsx
│   │   └── Button.tsx (Shadcn UI)
│   ├── ActivityList.tsx
│   │   └── ActivityItem.tsx
│   │       └── Button.tsx (Shadcn UI)
│   ├── FeedbackWidget.tsx
│   │   └── Button.tsx (Shadcn UI)
│   └── ConfirmationModal.tsx
```

## 4. Component Details

### `ItineraryView.tsx`

- **Component description**: The main container component that manages the state for the entire view. It fetches data for saved plans, receives data for draft plans, and orchestrates user interactions like toggling edit mode and saving the plan.
- **Main elements**: Renders child components: `PlanMetadata`, `DisclaimerBanner`, `PlanActions`, `ActivityList`, `FeedbackWidget`, and `ConfirmationModal`.
- **Handled interactions**: Toggles between "view" and "edit" modes. Initiates the API call to save the plan.
- **Handled validation**: None directly; validation is handled by child components or the backend API.
- **Types**: `ItineraryViewModel`
- **Props**: `planData: ItineraryViewModel`, `isDraft: boolean`

### `PlanActions.tsx`

- **Component description**: Displays the main action buttons for the plan. Its state and rendered buttons change based on the view mode.
- **Main elements**: Contains `Button` components for "Edit Plan," "Save Plan," and "Cancel."
- **Handled interactions**:
  - `onEditClick`: Toggles the view into "edit mode."
  - `onSaveClick`: Triggers the save plan action.
  - `onCancelClick`: Discards changes and reverts to "view mode."
- **Handled validation**: For active plan: The "Save Plan" button is disabled until changes are made to the itinerary (`isDirty` prop is true). For draft plan, "Save Plan" is enabled, because it is not in DB yet.
- **Types**: None
- **Props**: `isEditing: boolean`, `isDirty: boolean`, `onEdit: () => void`, `onSave: () => void`, `onCancel: () => void`

### `ActivityList.tsx`

- **Component description**: Renders the list of activities, grouped and displayed by day.
- **Main elements**: Maps over `DayViewModel[]` to render a heading for each day (e.g., "Day 1") followed by a list of `ActivityItem` components for that day.
- **Handled interactions**: Passes event handlers for moving and deleting activities down to child `ActivityItem` components.
- **Handled validation**: None.
- **Types**: `DayViewModel[]`
- **Props**: `days: DayViewModel[]`, `isEditing: boolean`, `onMoveUp: (activityId: string) => void`, `onMoveDown: (activityId: string) => void`, `onDelete: (activityId: string) => void`

### `ActivityItem.tsx`

- **Component description**: Displays a single activity. In "view mode," it shows the activity name and a link to Google Maps. In "edit mode," it adds controls for reordering and deletion.
- **Main elements**: `div` containing the activity name, an `<a>` tag for the Google Maps link, and conditionally rendered `Button` components for actions.
- **Handled interactions**:
  - `Move Up`: Calls the `onMoveUp` prop with its `id`.
  - `Move Down`: Calls the `onMoveDown` prop with its `id`.
  - `Delete`: Calls the `onDelete` prop with its `id`.
- **Handled validation**:
  - The "Move Up" button is disabled if `isFirst` prop is true.
  - The "Move Down" button is disabled if `isLast` prop is true.
- **Types**: `ActivityViewModel`
- **Props**: `activity: ActivityViewModel`, `isEditing: boolean`, `isFirst: boolean`, `isLast: boolean`, `onMoveUp: (activityId: string) => void`, `onMoveDown: (activityId: string) => void`, `onDelete: (activityId: string) => void`

## 5. Types

The following custom ViewModel types will be created in a file like `src/components/itinerary/types.ts` to manage UI state effectively.

- **`ActivityViewModel`**: Represents a single activity in the UI, augmented with a client-side ID for state management.

  ```typescript
  export interface ActivityViewModel {
    id: string; // Unique client-side ID (e.g., UUID v4)
    dayNumber: number;
    position: number;
    name: string;
    latitude: number;
    longitude: number;
    googleMapsUrl: string;
  }
  ```

- **`DayViewModel`**: A structure for grouping activities by day for rendering.

  ```typescript
  export interface DayViewModel {
    dayNumber: number;
    activities: ActivityViewModel[];
  }
  ```

- **`ItineraryViewModel`**: Represents the complete data needed for the view.
  ```typescript
  export interface ItineraryViewModel {
    id?: string; // Plan ID if it's a saved plan
    cityId: string;
    cityName: string;
    durationDays: number;
    tripIntensity: "full day" | "half day";
    userNotes?: string;
    activities: ActivityViewModel[];
    disclaimer: string;
  }
  ```

## 6. State Management

A custom React hook, `useItineraryState`, will be created to encapsulate all the state and logic for managing the itinerary. This hook will be responsible for:

- Storing the current state of the plan's activities (`ActivityViewModel[]`).
- Storing the original state to compare for changes (`isDirty` flag).
- Managing the "view" vs. "edit" mode (`isEditing` flag).
- Providing handler functions to modify the state:
  - `handleMoveUp(activityId: string)`
  - `handleMoveDown(activityId: string)`
  - `handleDelete(activityId: string)`
  - `handleSetEditing(isEditing: boolean)`
  - `handleCancel()`: Resets changes to the original state.
- This approach centralizes the business logic, making the `ItineraryView` component cleaner and focused on rendering.

## 7. API Integration

The view will integrate with the `POST /api/plans/save` endpoint to save a new or updated plan.

- **Action**: When the user clicks the "Save Plan" button.
- **Request Payload**: The frontend will transform the current state (`ActivityViewModel[]`) into the required `SavePlanRequestDTO` format. This involves:
  1.  Mapping `ActivityViewModel` to `SavePlanActivityDTO`, ensuring `day_number` and `position` are updated based on the user's edits.
  2.  Constructing the main `SavePlanRequestDTO` object with `city_id`, `duration_days`, etc.
- **Request Type**: `SavePlanRequestDTO` (from `src/types.ts`)
- **Response Type**: `SavePlanResponseDTO` (from `src/types.ts`)
- **Success Handling**: On a `201 Created` response, display a success toast/notification (e.g., "Plan saved successfully!") and changes display mode to "view"

## 8. User Interactions

- **View Plan**: On load, the user sees the plan in read-only mode.
- **Edit Plan**: Clicking "Edit Plan" switches to "edit mode," revealing "Move Up," "Move Down," and "Delete" buttons for each activity. The "Save Plan" and "Cancel" buttons appear.
- **Reorder Activity**: Clicking "Move Up" or "Move Down" swaps the activity with its adjacent sibling within the same day. The UI updates instantly.
- **Delete Activity**: Clicking "Delete" removes the activity from the list. The UI updates instantly.
- **Save Changes**: Clicking "Save Plan" sends the modified itinerary to the backend. This button is only enabled after at least one change has been made.
- **Cancel Edit**: Clicking "Cancel" discards all changes made during the edit session and returns to "view mode."

## 9. Conditions and Validation

- **"Move Up/Down" Button State**:
  - The "Move Up" button in `ActivityItem` is disabled for the first activity of each day.
  - The "Move Down" button is disabled for the last activity of each day.
- **"Save Plan" Button State**:
  - The "Save Plan" button in `PlanActions` (when editing existing plan) is disabled until the user modifies the plan (reorders or deletes an activity). The `useItineraryState` hook will track this `isDirty` state by comparing the current activities with the initial state. For new plan, "Save Plan" button should be always active, because we want user to be able to save newly created plan without changes.
- **API Validation**: The backend validates the `SavePlanRequestDTO`. The frontend should ensure the data structure is correct before sending, but detailed business rule validation (e.g., `day_number` must be `<= duration_days`) is handled by the API.

## 10. Error Handling

- **API Fetch Errors (for saved plans)**:
  - If the API returns a `404 Not Found` (invalid plan ID), redirect the user to a generic "Not Found" page.
  - If the API returns a `403 Forbidden` (user does not own the plan), redirect to the "Not Found" page to avoid disclosing the plan's existence.
  - For `500 Internal Server Error` or network failures, display a generic error message (e.g., "Could not load plan. Please try again later.").
- **API Save Errors**:
  - On a `400 Bad Request` (validation error), display a specific error message to the user if possible, or a generic "Could not save plan due to invalid data."
  - On a `401 Unauthorized`, redirect the user to the login page.
  - On a `500 Internal Server Error`, display a generic message like "An unexpected error occurred. Please try saving again."

## 11. Implementation Steps

1.  **Create Folder Structure**: Set up the `src/components/itinerary/` directory.
2.  **Define Types**: Create `src/components/itinerary/types.ts` and define `ActivityViewModel`, `DayViewModel`, and `ItineraryViewModel`.
3.  **Build Static Components**: Implement the stateless UI components: `PlanMetadata`, `DisclaimerBanner`, `ActivityItem`, `ActivityList`, `PlanActions`, and `FeedbackWidget` using hardcoded props.
4.  **Develop `useItineraryState` Hook**: Create the custom hook to manage all state logic: activities, editing state, dirty checking, and handler functions.
5.  **Build `ItineraryView` Container**: Assemble the static components in `ItineraryView.tsx`. Wire up the `useItineraryState` hook and pass state and handlers down as props.
6.  **Set up Routing**: Create the Astro page `src/pages/plans/[planId].astro`. Implement the logic to differentiate between a `draft` plan (using a client-side store) and a saved plan (fetching from an API).
7.  **Implement API Integration**:
    - Write the API client function to fetch a plan by its ID.
    - Write the API client function for `POST /api/plans/save`, including the logic to transform ViewModel data to the required `SavePlanRequestDTO`.
    - Integrate these functions into the Astro page and the `ItineraryView` component.
8.  **Add Error Handling**: Implement the error handling strategies for API fetch and save operations, including redirects and user-facing messages.
9.  **Implement Feedback and Modals**: Wire up the `FeedbackWidget` and implement the `ConfirmationModal` for any future delete-plan functionality.
10. **Refine and Test**: Thoroughly test all user interactions, edge cases (e.g., a day with one activity), and error states. Ensure the UI is responsive and accessible.
