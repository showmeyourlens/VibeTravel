# API Endpoint Implementation Plan: PATCH /plans/{planId}

## 1. Endpoint Overview
This document outlines the implementation plan for the `PATCH /plans/{planId}` REST API endpoint. The endpoint's purpose is to allow authenticated users to update their existing travel plans. This includes modifying plan-level metadata such as duration and trip intensity, as well as reordering and reassigning activities within the plan.

## 2. Request Details
- **HTTP Method:** `PATCH`
- **URL Structure:** `/api/plans/{planId}`
- **Parameters:**
  - **Required (URL):**
    - `planId` (UUID): The unique identifier of the plan to update.
  - **Optional (Body):**
    - All fields in the request body are optional. The client can send any subset of these fields to perform a partial update.
- **Request Body:** A JSON object with the following structure:
  ```json
  {
    "activities": [
      { "id": "uuid-for-activity-1", "day_number": 2, "position": 1 },
      { "id": "uuid-for-activity-2", "day_number": 2, "position": 2 }
    ]
  }
  ```

## 3. Used Types
The following new Data Transfer Objects (DTOs) and Command models need to be added to `src/types.ts` to support this endpoint.

- **`UpdatePlanActivityDTO`**: Defines the structure for an activity being updated.
  ```typescript
  export interface UpdatePlanActivityDTO {
    id: string;
    day_number: number;
    position: number;
  }
  ```
- **`UpdatePlanRequestDTO`**: Defines the shape of the incoming request body.
  ```typescript
  export interface UpdatePlanRequestDTO {
    activities?: UpdatePlanActivityDTO[];
  }
  ```
- **`UpdatePlanCommand`**: Represents the internal data structure used by the service layer after validation and transformation.
  ```typescript
  export interface UpdatePlanCommand {
    activities?: {
      id: string;
      dayNumber: number;
      position: number;
    }[];
  }
  ```

## 4. Response Details
- **Success (200 OK):** Returned when the plan is updated successfully.
  ```json
  {
    "message": "Plan updated successfully."
  }
  ```
- **Error (4xx/5xx):** Returned on validation failure, authorization failure, or server error.
  ```json
  {
    "error": "Descriptive error message."
  }
  ```

## 5. Data Flow
1.  The client sends a `PATCH` request to `/api/plans/{planId}`.
2.  The Astro middleware intercepts the request to verify the user's authentication status.
3.  The API route handler validates the `planId` parameter and the request body using a Zod schema.
4.  If validation fails, a `400 Bad Request` response is returned with error details.
5.  The validated request DTO is mapped to an `UpdatePlanCommand`, including the `userId` from the authenticated session (`context.locals.user`).
6.  The command is passed to the `PlanService.updatePlan()` method.
7.  The service performs additional business logic validation (e.g., checking for unique positions within a day).
8.  The service initiates a database transaction with the Supabase client.
9.  If metadata (e.g., `duration_days`) is present, the `plans` table is updated.
10. If `activities` are present, the service iterates through them and issues `UPDATE` statements for the `plan_activities` table.
11. The transaction is committed. If any database operation fails (including RLS checks), the transaction is rolled back.
12. The service layer returns a success or error result to the route handler.
13. The route handler constructs and sends the final HTTP response (200 OK or an appropriate error code).

## 6. Security Considerations
- **Authentication:** All requests must include a valid JWT. This is enforced by the application's middleware, which will reject unauthenticated requests with a `401 Unauthorized` status.
- **Authorization:** Supabase's Row Level Security (RLS) is enabled on the `plans` and `plan_activities` tables. This ensures that a user can only update plans that they own. Any attempt to modify another user's data will be blocked at the database level, resulting in a `404 Not Found` response.
- **Input Validation:** All incoming data from the request body and URL parameters will be rigorously validated using Zod to prevent common vulnerabilities like injection attacks and ensure data integrity.

## 7. Error Handling
- **400 Bad Request:** Invalid UUID format for `planId`, request body fails schema validation, or business rules are violated (e.g., duplicate activity positions).
- **401 Unauthorized:** The user is not authenticated.
- **404 Not Found:** The requested `planId` does not exist or does not belong to the authenticated user.
- **500 Internal Server Error:** Unexpected database errors, transaction failures, or other unhandled exceptions. These errors will be logged for diagnostics.

## 8. Performance Considerations
- The primary performance consideration is the update of multiple activities. For the expected scale of a single travel plan, updating activities within a loop inside a single database transaction is efficient.
- This approach maintains data consistency and is performant enough for the application's needs. Batching updates into a single SQL statement is a potential future optimization but is not required for the initial implementation.

## 9. Implementation Steps
1.  **Update Types:** Add `UpdatePlanActivityDTO`, `UpdatePlanRequestDTO`, and `UpdatePlanCommand` to `src/types.ts`.
2.  **Create Zod Schema:** In `src/lib/schemas/plan.schema.ts`, define a new Zod schema for validating the `UpdatePlanRequestDTO`. Add unit tests for this schema.
3.  **Extend Plan Service:** Implement the `updatePlan(command: UpdatePlanCommand)` method in the `PlanService` at `src/pages/api/services/plan.service.ts`. This method will contain the core business logic and database transaction. Add integration tests for this service method.
4.  **Create API Endpoint:** file at `src/pages/api/plans/[planId].ts` already exist, add function to it.
5.  **Implement PATCH Handler:** Inside the file, implement the `PATCH` request handler. This handler will be responsible for validation, calling the `PlanService`, and returning the appropriate HTTP response.
