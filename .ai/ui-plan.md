# UI Architecture for VibeTravel

## 1. UI Structure Overview

The user interface for VibeTravel will be a modern, responsive web application built with Astro and React. Astro will manage the overall site structure, routing, and static content, providing a fast initial load. Dynamic and interactive user experiences, such as the plan generation wizard and itinerary editor, will be implemented as React "islands."

The architecture is dashboard-centric. Upon authentication, users land on a "My Plans" dashboard, which serves as the central hub for viewing existing plans and initiating the creation of new ones. A client-side state management solution (e.g., React Context) will be used to handle "draft" itineraries, providing a seamless editing experience before a plan is saved.

All UI elements will be built using the `shadcn/ui` component library to ensure visual consistency, accessibility, and rapid development. The application will feature a global notification system for user feedback and gracefully handle various API states, including loading and errors, to create a robust and user-friendly experience.

## 2. View List

### View: Dashboard ("My Plans")

- **View Path**: `/dashboard`
- **Main Purpose**: To serve as the primary landing page for authenticated users, allowing them to view their saved travel plans and start creating new ones.
- **Key Information to Display**:
  - A list of the user's saved plans, summarized in cards.
  - An "empty state" for new users, guiding them to create their first plan.
  - A prominent "Create New Plan" call-to-action.
- **Key View Components**: `Header`, `PlanCard`, `Button` (for creating a new plan), `EmptyStateGraphic`.
- **UX, Accessibility, and Security Considerations**:
  - **UX**: Implements infinite scroll for plan pagination by interacting with the `GET /plans` endpoint. Uses skeleton loaders during the initial data fetch to improve perceived performance.
  - **Accessibility**: The "Create New Plan" button will be clearly labeled and focusable. Plan cards will have accessible names.
  - **Security**: This view requires user authentication. API calls will include an auth token. A `401 Unauthorized` response will trigger a redirect to the login page.

### View: Plan Wizard

- **View Path**: `/plans/new`
- **Main Purpose**: To collect the necessary information from the user to generate a new travel plan via the AI service.
- **Key Information to Display**:
  - A multi-step form to input:
    - Destination City (from a predefined list fetched via `GET /cities`).
    - Trip Duration (1-5 days).
    - Trip Intensity ("full day" or "half day").
    - User Notes (free-form text).
- **Key View Components**: `Wizard` (as a stateful React component), `Stepper`, `Select`, `Input`, `RadioGroup`, `Button` (for navigation and submission).
- **UX, Accessibility, and Security Considerations**:
  - **UX**: The wizard breaks down the form into logical steps. Displays a full-screen loading overlay after the user submits their preferences to the `POST /plans/generate` endpoint. Provides clear validation feedback for invalid fields (`400 Bad Request`).
  - **Accessibility**: All form fields will have associated labels. Stepper provides a clear indication of progress.
  - **Security**: Requires user authentication.

### View: Itinerary View

- **View Path**: `/plans/draft` (a conceptual client-side state for a new plan) and `/plans/:planId` (for a saved plan).
- **Main Purpose**: To display the details of a generated or saved travel plan and allow for modifications.
- **Key Information to Display**:
  - Plan metadata (City, Duration, etc.).
  - A day-by-day breakdown of activities.
  - Each activity's name and a link to Google Maps.
  - A persistent disclaimer banner.
  - A user feedback component ("Was this plan helpful?").
- **Key View Components**: `ItineraryView` (a unified component), `ActivityItem`, `Button` (Save, Edit, Move Up/Down, Delete), `Banner`, `FeedbackWidget`, `ConfirmationModal`.
- **UX, Accessibility, and Security Considerations**:
  - **UX**: Opens in a read-only "view mode" by default for saved plans. An "Edit Plan" button toggles "edit mode." Implements updates for reordering (`PATCH /plans/:planId`) and deleting activities. Deleting a plan requires confirmation via a modal.
  - **Accessibility**: "Move Up/Down" buttons provide an accessible alternative to drag-and-drop. All interactive controls will have clear focus states and ARIA attributes.
  - **Security**: Requires user authentication. Handles `403 Forbidden` errors by redirecting to a "Not Found" page to prevent information leakage. `404 Not Found` for invalid plan IDs is handled similarly.

### View: Not Found

- **View Path**: `/404` (handled by Astro's file-based routing).
- **Main Purpose**: To inform the user that the requested page does not exist or they do not have permission to view it.
- **Key Information to Display**:
  - A user-friendly error message.
  - A link to navigate back to the Dashboard.
- **Key View Components**: `Header`, `MessageCard`.
- **UX, Accessibility, and Security Considerations**:
  - **UX**: Provides a clear and helpful path for users who land on an invalid URL.
  - **Accessibility**: The content is simple and easily readable by screen readers.
  - **Security**: Serves as the redirect target for `403 Forbidden` API responses, obscuring the existence of a resource the user cannot access.

### View: Login

- **View Path**: `/login`
- **Main Purpose**: To authenticate users. (Note: UI/UX for this view is deferred per planning session).
- **Key Information to Display**: N/A
- **Key View Components**: N/A
- **UX, Accessibility, and Security Considerations**:
  - **Security**: This page will be the redirect target for any API call that results in a `401 Unauthorized` error.

## 3. User Journey Map

### Primary Journey: Creating a New Travel Plan

This journey maps to user stories **US-003, US-004, US-005, US-006, US-007, and US-008**.

1.  **Start**: The authenticated user lands on the **Dashboard** (`/dashboard`).
2.  **Initiate**: The user clicks the "Create New Plan" button.
3.  **Navigate**: The application navigates to the **Plan Wizard** view (`/plans/new`).
4.  **Input**: The user completes the wizard's multi-step form and clicks "Generate Plan." The system shows a full-screen loading indicator while calling `POST /plans/generate`.
5.  **Display**: The application transitions to the **Itinerary View**, displaying the newly generated "draft" plan in a client-side state. The plan is by default opened in edit mode without user interaction with edit mode button, and cannot be switched to "view mode" until it's saved.
6.  **Customize**: The user modifies the plan by reordering or deleting activities. These changes are reflected instantly via optimistic UI updates.
7.  **Save**: The user clicks the "Save Plan" button. The application sends the final plan structure to `POST /plans`.
8.  **Confirm & End**: A success notification is displayed. The application redirects the user back to the **Dashboard**, where the new plan now appears at the top of the list.

### Secondary Journey: Viewing and Editing a Saved Plan

This journey maps to user story **US-009**.

1.  **Start**: The authenticated user is on the **Dashboard** (`/dashboard`).
2.  **Select**: The user clicks on a previously saved plan.
3.  **Navigate**: The application navigates to the **Itinerary View** (`/plans/:planId`), fetching plan data from `GET /plans/:planId`.
4.  **View**: The plan is displayed in a read-only "view mode."
5.  **Initiate Edit**: The user clicks the "Edit Plan" button.
6.  **Edit**: The UI switches to "edit mode," enabling controls for reordering and deleting activities. Changes are saved via `PATCH /plans/:planId` after user clicking "save" button.
7.  **End**: The user navigates away or closes the view.

## 4. Layout and Navigation Structure

- **Global Layout**: A primary Astro layout component will wrap all views. It will include a persistent `Header` and a main content area for view-specific content.
- **Header Navigation**: The `Header` component will contain the application logo and primary navigation links.
  - **Authenticated Users**: The header will display links to "My Plans" (`/dashboard`) and a "Logout" button.
  - **Unauthenticated Users**: The header will display links to "Login" (`/login`) and "Sign Up" (`/signup`).
- **Routing**:
  - **Page-Level**: Astro's file-based routing will manage navigation between distinct pages (e.g., `src/pages/dashboard.astro`, `src/pages/plans/[planId].astro`).
  - **Component-Level**: For complex components like the `Plan Wizard`, navigation between steps will be managed by client-side state within the React component itself, without changing the URL.

## 5. Key Components

- **`GlobalNotifier`**: A singleton component that displays toast notifications for success confirmations (e.g., "Plan saved!") and API errors (e.g., "Failed to generate plan"), providing non-blocking feedback to the user.
- **`PlanCard`**: A reusable component used on the Dashboard to display a summary of a saved travel plan. It will show key information like the destination city and duration, and act as a navigation link to the plan's Itinerary View.
- **`ItineraryView`**: A versatile component for displaying a full travel plan. It uses an adapter to accept data from both the AI generation endpoint (`/plans/generate`) and the saved plan endpoint (`/plans/:planId`), and can toggle between "view" and "edit" modes.
- **`Wizard`**: A stateful React component that encapsulates the entire multi-step form logic for creating a new plan. It manages its own internal state for the current step and form data.
- **`LoadingOverlay`**: A full-screen overlay with a loading indicator. It is used to prevent user interaction during critical asynchronous operations like the initial AI plan generation.
- **`SkeletonLoader`**: A component that mimics the layout of content before it has loaded. It will be used on the Dashboard to create a placeholder for the `PlanCard` list while data is being fetched.
- **`ConfirmationModal`**: A dialog that prompts the user for confirmation before executing a destructive action, such as deleting whole saved plan (`DELETE /plans/:planId`).
