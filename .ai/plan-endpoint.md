# API Endpoint Implementation Plan: Save Finalized Plan

## 1. Endpoint Overview
- **HTTP Method:** POST
- **Path:** `/api/plans` (Astro route: `src/pages/api/plans/save.ts`)
- **Purpose:** Persist a finalized travel plan including user revisions (reorders/deletions).

## 2. Request Details
- **Headers:**
  - `Authorization: Bearer <JWT>`
- **Request Body (application/json):**
```json
{
  "city_id": "UUID",
  "duration_days": 3,
  "trip_intensity": "full day",
  "user_notes": "I love art and history.",
  "activities": [
    {
      "day_number": 1,
      "position": 1,
      "name": "Louvre Museum",
      "latitude": 48.8606,
      "longitude": 2.3376,
      "notes": ""
    }
    // ...
  ]
}
```
- **Required Fields:** `city_id`, `duration_days`, `trip_intensity`, `activities`
- **Optional Fields:** `user_notes`

## 3. Used Types
- **DTOs & Command Models:**
  - `SavePlanRequestDTO` (infer from `saveRequestSchema`)
  - `PlanActivityDTO` (per-item activity schema)
  - `SavePlanResponseDTO` (response shape)
  - `SavePlanCommand`:
    ```ts
    interface SavePlanCommand {
      userId: string;
      cityId: string;
      durationDays: number;
      tripIntensity: 'full day' | 'half day';
      userNotes?: string;
      activities: PlanActivityDTO[];
    }
    ```

## 4. Response Details
- **Status Codes:**
  - `201 Created` – Plan persisted successfully
  - `400 Bad Request` – Validation failure
  - `401 Unauthorized` – Missing/invalid JWT
  - `500 Internal Server Error` – Database or server error
- **Success Response (201):**
```json
{
  "id": "UUID",
  "status": "active",
  "created_at": "ISO8601 timestamp",
  "updated_at": "ISO8601 timestamp"
}
```

## 5. Data Flow
1. Extract Supabase client from `context.locals.supabase`.
2. Authenticate user via `supabase.auth.getUser()`; return `401` if no valid session.
3. Parse and validate request body against `saveRequestSchema` using Zod.
4. Build `SavePlanCommand` with `userId` from authenticated user.
5. Call `PlanService.saveFinalPlan(command)`:
   - Insert a new row into `plans` table.
   - Bulk insert activities into `plan_activities` with the new `plan_id`.
6. Return `SavePlanResponseDTO` with `201 Created`.

## 6. Security Considerations
- **Authentication:** Require JWT; return `401` if missing/invalid.
- **Authorization:** Rely on Supabase row-level security (`insert_own_plans` policy).
- **Input Validation:** Prevent malformed data and enforce `day_number <= duration_days` via schema refinement.
- **Data Sanitization:** Use parameterized queries from Supabase client to avoid SQL injection.

## 7. Error Handling
- **Validation Errors (Zod):** Return `400` with detailed error messages.
- **Auth Errors:** Return `401 Unauthorized`.
- **Database Errors:** Catch and log via `logAppError`, return `500`.
- **Constraint Violations:** Map unique or foreign-key failures to `400 Bad Request` with context.

## 8. Performance
- **Bulk Operations:** Insert activities in a single bulk call.
- **Atomicity:** Use a transaction (if supported via Supabase RPC) to ensure plan and activities are saved together.
- **Indexes:** Leverage existing indexes on `plan_activities(plan_id, day_number, position)`.

## 9. Implementation Steps
1. **Schema Definition:**
   - Add `saveRequestSchema` and `SavePlanRequestDTO` & `PlanActivityDTO` to `src/lib/schemas/plan.schema.ts`.
2. **Service Layer:**
   - Create `PlanService` in `src/lib/services/plan.service.ts` with `saveFinalPlan(command: SavePlanCommand)`.
3. **API Route:**
   - Create `src/pages/api/plans/save.ts`:
     - Extract Supabase client and user.
     - Validate input.
     - Call `PlanService.saveFinalPlan`.
     - Send response.
4. **Error Logging:** Use `logAppError` in `src/lib/utils/error-logger.ts` for unexpected failures.
5. **Testing:**
   - Unit tests for validation schema and service method.
   - Integration tests for the endpoint (success, validation failure, auth failure).
6. **Documentation:**
   - Update README with endpoint details.
7. **Review**: Conduct code review, ensure linting passes, validate behavior in staging.

