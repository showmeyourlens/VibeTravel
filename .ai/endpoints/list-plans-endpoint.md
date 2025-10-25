# API Endpoint Implementation Plan: GET /plans

## 1. Endpoint Overview
This endpoint retrieves a paginated list of travel plans for the currently authenticated user. It supports sorting and pagination to allow for efficient browsing of a user's plans.

## 2. Request Details
- **HTTP Method:** `GET`
- **URL Structure:** `/api/plans`
- **Parameters:**
  - **Required:** None
  - **Optional:**
    - `page` (integer, default: `1`): The page number to retrieve.
    - `page_size` (integer, default: `20`): The number of plans per page.
    - `sort` (string, default: `created_at`): The field to sort the plans by.
- **Request Body:** None

## 3. Used Types

### DTOs
```typescript
// src/types.ts

export interface PlanDto {
  id: string;
  city_id: string;
  duration_days: number;
  trip_intensity: "full day" | "half day";
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface PaginationDto {
  page: number;
  page_size: number;
  total: number;
}

export interface ListPlansResponseDto {
  data: PlanDto[];
  pagination: PaginationDto;
}
```

### Command Models
```typescript
// src/lib/services/plan.service.ts

export interface ListPlansQuery {
  page: number;
  pageSize: number;
  sort: string;
  userId: string;
}
```

## 4. Response Details
- **Success (200 OK):**
  ```json
  {
    "data": [
      { 
        "id": "UUID", 
        "city_id": "UUID", 
        "duration_days": 3, 
        "trip_intensity": "full day", 
        "status": "active", 
        "created_at": "...", 
        "updated_at": "..." 
      }
    ],
    "pagination": { 
      "page": 1, 
      "page_size": 20, 
      "total": 42 
    }
  }
  ```
- **Error (400 Bad Request):**
  ```json
  { "error": "Invalid query parameters", "details": "..." }
  ```
- **Error (401 Unauthorized):**
  ```json
  { "error": "Unauthorized" }
  ```
- **Error (500 Internal Server Error):**
  ```json
  { "error": "An unexpected error occurred." }
  ```

## 5. Data Flow
1. The request is received at the `/api/plans` Astro endpoint.
2. The Astro middleware (`src/middleware/index.ts`) verifies the user's authentication status using `supabase.auth.getSession()`. If the user is not authenticated, it returns a 401 response.
3. The endpoint handler parses and validates the `page`, `page_size`, and `sort` query parameters using a Zod schema.
4. If validation fails, a 400 response is returned with error details.
5. If validation succeeds, the `plan.service.ts` is called with the `ListPlansQuery` containing the validated parameters and the user's ID.
6. The `PlanService` constructs a Supabase query to fetch the user's plans from the `plans` table.
   - It applies a `.eq('user_id', userId)` filter.
   - It uses `.range()` for pagination based on `page` and `pageSize`.
   - It uses `.order()` for sorting based on the `sort` parameter.
7. The service also executes a separate query to get the total count of the user's plans for the pagination object.
8. The service maps the database rows to `PlanDto` objects.
9. The service returns the list of plans and the total count to the endpoint handler.
10. The endpoint handler formats the response into the `ListPlansResponseDto` structure and sends it back to the client with a 200 status code.

## 6. Security Considerations
- **Authentication:** Handled by the Astro middleware, which will ensure that only authenticated users can access this endpoint. The `user_id` will be retrieved from the Supabase session.
- **Authorization:** Supabase's Row-Level Security (RLS) is enabled on the `plans` table. The policy `select_own_plans` ensures that a user can only query plans where the `user_id` column matches their authenticated UID (`auth.uid()`). This provides a critical layer of data protection.
- **Input Validation:** All query parameters (`page`, `page_size`, `sort`) will be strictly validated using a Zod schema to prevent invalid data from reaching the service layer.
    - `page` will be validated as a positive integer.
    - `page_size` will be validated as a positive integer with a maximum value of 100 to prevent DoS attacks.
    - `sort` will be validated against an allow-list of columns (`created_at`, `updated_at`, `duration_days`) to prevent SQL injection or unexpected ordering behavior.

## 7. Error Handling
- **400 Bad Request:** Returned if query parameter validation fails.
- **401 Unauthorized:** Returned by the middleware if the user is not logged in.
- **500 Internal Server Error:** Returned for any unexpected errors, such as a database query failure. These errors will be logged in the `app_error_logs` table using the `error-logger.ts` utility, including the user ID, error message, and stack trace.

## 8. Performance Considerations
- **Database Indexing:** An index `idx_plans_user_created` already exists on `(user_id, created_at DESC)`, which is optimal for the default sort order. Additional indexes should be considered if other sort options become common.
- **Pagination:** The use of `range()` pagination is efficient for querying subsets of data and avoids loading large datasets into memory.
- **Query Optimization:** Two separate queries are made (one for data, one for count). This is generally efficient in PostgreSQL. For very large datasets, performance could be monitored.

## 9. Implementation Steps
1. **Create Endpoint File:** Create a new file `src/pages/api/plans/index.ts`.
2. **Add Zod Schema:** In `src/lib/schemas/plan.schema.ts`, add a Zod schema for validating the `GET /api/plans` query parameters.
3. **Update Plan Service:** In `src/lib/services/plan.service.ts`:
   - Create the `ListPlansQuery` interface.
   - Implement a new method `listUserPlans(query: ListPlansQuery)` that fetches plans and their total count from the database based on `userId`, pagination, and sorting parameters.
4. **Implement Endpoint Logic:** In `src/pages/api/plans/index.ts`:
   - Define a `GET` handler function that conforms to `APIRoute`.
   - Use `Astro.locals.supabase` to ensure user is authenticated.
   - Parse and validate query parameters using the new Zod schema.
   - On successful validation, call the `listUserPlans` method from the `PlanService`.
   - Format the result into the `ListPlansResponseDto` and return a `200 OK` JSON response.
   - Implement a `try...catch` block to handle potential errors, log them, and return a `500 Internal Server Error` response.
