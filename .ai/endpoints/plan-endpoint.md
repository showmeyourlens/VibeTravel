# API Endpoint Implementation Plan: POST /plans

## 1. Endpoint Overview

This endpoint persists a user’s finalized travel plan and its associated activities to the database. It expects a valid JWT, validates the request payload, writes to `plans` and `plan_activities` tables, and returns the created plan’s metadata.

## 2. Request Details

- HTTP Method: POST
- URL: `/plans`
- Authentication: Bearer token (JWT) required
- Parameters:
  - Required:
    - `city_id` (UUID)
    - `duration_days` (integer, 1–5)
    - `trip_intensity` (`"full day"` | `"half day"`)
    - `activities` (array of activity objects)
  - Optional:
    - `user_notes` (string, max 500 chars)
- Request Body Schema (TypeScript DTO):
  ```ts
  type SavePlanRequestDTO = {
    city_id: string;
    duration_days: number;
    trip_intensity: "full day" | "half day";
    user_notes?: string;
    activities: Array<{
      day_number: number;
      position: number;
      name: string;
      latitude: number;
      longitude: number;
      notes?: string;
    }>;
  };
  ```

## 3. Used Types

- **Zod Schemas** (src/lib/schemas/plan.schema.ts)
  - `savePlanSchema` (new)
  - `planActivitySchema` (extend existing)
- **DTOs**
  - `SavePlanRequestDTO` (inferred from `savePlanSchema`)
  - `ActivityDTO`
- **Command Model**
  - `SavePlanCommand` { user_id, SavePlanRequestDTO }

## 4. Response Details

- **201 Created**
  ```json
  {
    "id": "UUID",
    "status": "active",
    "created_at": "2025-10-17T12:34:56Z",
    "updated_at": "2025-10-17T12:34:56Z"
  }
  ```
- **Error Status Codes**
  - 400 Bad Request: validation failure
  - 401 Unauthorized: missing/invalid JWT
  - 404 Not Found: referenced city_id does not exist
  - 500 Internal Server Error: unexpected failures

## 5. Data Flow

1. **Middleware** extracts and validates JWT, populates `context.locals.user_id`.
2. **Handler** reads and parses request body.
3. **Validation** using Zod `savePlanSchema`; includes:
   - Field types and ranges
   - `day_number <= duration_days` refinement
   - Unique `(day_number, position)` check
4. **Service** (`PlanService.savePlan`):
   - Insert into `plans` table using Supabase client
   - Map activities with returned `plan.id` and bulk insert into `plan_activities`
   - Wrap in safe transaction or manual rollback on failure
5. **Response**: return metadata from `plans` insert

## 6. Security Considerations

- **Authentication**: JWT validated by Astro middleware
- **Authorization**: ensure `user_id` is taken from JWT, not request
- **Input Sanitization**: use Zod to prevent malformed data
- **SQL Injection**: use Supabase JS client parameterization
- **Rate Limiting**: consider upstream API gateway limits

## 7. Error Handling

- **Validation Errors**: return 400 with Zod error details
- **Auth Errors**: middleware returns 401 before handler
- **Foreign Key Violations**: catch Supabase error, map to 404 if city missing
- **Constraint Violations**: return 400 if activity uniqueness or day bound fails
- **Unexpected Exceptions**:
  - Log via `error-logger.ts` to `app_error_logs`
  - Return 500 with generic message

## 8. Performance Considerations

- **Batch Inserts**: bulk insert activities to reduce round trips
- **Indexes**: ensure `plan_id` foreign key and `(plan_id, day_number, position)` unique index
- **Payload Size**: limit maximum activities per plan (e.g., duration_days × max_per_day)

## 9. Implementation Steps

1. **Schema**: Add `savePlanSchema` and refine `planActivitySchema` in `src/lib/schemas/plan.schema.ts`.
2. **Service**: Create `PlanService.savePlan(command: SavePlanCommand)` in `src/lib/services/plan.service.ts`.
3. **Types**: Define DTO and Command types in `src/types.ts` or dedicated `src/lib/types`.
4. **Handler**: Create route file `src/pages/api/plans/index.ts`:
   - Apply `export const prerender = false`
   - Import Zod schema, PlanService
   - Validate body, construct command, call service
   - Handle and map errors
5. **Middleware**: Ensure JWT is validated and `user_id` is available in `context.locals`.
6. **Error Logging**: Use `errorLogger.log({ message, payload, user_id, severity })` on 500 errors.
7. **Testing**: Write unit tests for:
   - Schema validation (valid/invalid payloads)
   - Service logic: successful insert, simulated failures
   - Route handler: full integration test with Supabase emulator or test DB
8. **Documentation**: Update API docs (README.md) with endpoint spec and example requests/responses.
9. **Review**: Conduct code review, ensure linting passes, validate behavior in staging.
