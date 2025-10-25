# API Endpoint Implementation Plan: GET /cities

## 1. Endpoint Overview

Retrieve the list of available destination cities from the database. This endpoint returns a collection of city objects, each containing a UUID `id` and a `name`.

## 2. Request Details

- HTTP Method: GET
- URL Structure: `/api/cities`
- Query Parameters: None
- Request Body: None

## 3. Used Types

- **CityDto**: Data Transfer Object representing a city.
  ```ts
  export type CityDto = {
    id: string;
    name: string;
  };
  ```

## 4. Response Details

- Success (200 OK): Returns an array of `CityDto` objects.
  ```json
  [
    { "id": "UUID", "name": "Paris" },
    { "id": "UUID", "name": "Rome" },
    …
  ]
  ```
- Errors:
  - 500 Internal Server Error: Database or service failure.

## 5. Data Flow

1. **Endpoint Handler** (`src/pages/api/cities.ts`): Receives the GET request.
2. **Service Layer** (`src/lib/services/cityService.ts`): Exposes `getCities()` to fetch data.
3. **Database Query**: Uses `supabase` from `context.locals` to run `.from('cities').select('id,name')`.
4. **DTO Transformation**: Maps raw rows into `CityDto` (trivial mapping).
5. **Response**: Returns JSON array with status 200.
6. **Error Logging**: On failures, log details to `app_error_logs` and return a 500 error.

## 6. Security Considerations

- **Authentication**: No authentication required; endpoint is public.
- **Authorization**: Not applicable.
- **Input Validation**: None (no parameters).
- **Output Sanitization**: Ensure the returned names are trusted from database constraints.

## 7. Error Handling

| Scenario                     | Status Code | Action                                                        |
| ---------------------------- | ----------- | ------------------------------------------------------------- |
| Database connection failure  | 500         | Log error to `app_error_logs` with severity `error`; respond. |
| Query execution error        | 500         | Log error; respond with generic error message.                |
| Unexpected runtime exception | 500         | Catch-all; log and respond.                                   |

## 8. Performance Considerations

- The `cities` table is expected to be small; a simple full-table select is acceptable.
- Enable caching headers if the list is infrequently updated (e.g., `Cache-Control: max-age=3600`).

## 9. Implementation Steps

1. Define `CityDto` in `src/types.ts`.
2. Create `cities.service.ts` in `src/lib/services/` with:
   - Function `async function getCities(locals): Promise<CityDto[]>` that uses `locals.supabase`.
3. In `src/pages/api/cities.ts`, implement:
   - `export const prerender = false`.
   - `export async function GET({ locals }): Response` handler invoking `getCities`, catching errors, logging, and returning JSON.
4. Implement error logging utility or use existing `logError` helper in `src/lib/utils.ts` to insert into `app_error_logs`.
5. Add zod schema file (optional) to validate output shape if needed.
6. Write unit tests for `getCities()` service and integration tests for endpoint.
7. Update project documentation and OpenAPI spec accordingly.
