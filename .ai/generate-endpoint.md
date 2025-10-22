# API Endpoint Implementation Plan: POST /plans/generate

## 1. Endpoint Overview

The `POST /plans/generate` endpoint allows authenticated users to generate a draft travel itinerary via an AI service without persisting it to the database. It validates incoming parameters, fetches city information, delegates itinerary creation to an AI-powered service, and returns the formatted draft plan.

## 2. Request Details

- HTTP Method: POST
- URL: `/plans/generate`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <supabase-access-token>`
- Request Body (JSON):
  ```ts
  interface GenerateDraftPlanRequestDTO {
    city_id: string; // UUID, required
    duration_days: number; // integer [1,5], required
    trip_intensity: 'full day' | 'half day'; // required
    user_notes?: string; // optional, max 500 chars
  }
  ```
- Query Params: none

## 3. Used Types

```ts
// Request
type GenerateDraftPlanRequestDTO = z.infer<typeof generateRequestSchema>;

// Application command
interface GenerateDraftPlanCommand {
  userId: string;
  cityId: string;
  durationDays: number;
  tripIntensity: 'full day' | 'half day';
  userNotes?: string;
}

// Response
interface PlanActivityDTO {
  day_number: number;
  position: number;
  name: string;
  latitude: number;
  longitude: number;
  google_maps_url: string;
}

interface GenerateDraftPlanResponseDTO {
  plan: {
    duration_days: number;
    trip_intensity: 'full day' | 'half day';
    activities: PlanActivityDTO[];
    disclaimer: string;
  };
}
```

## 4. Response Details

| Status | Condition                                        | Body                                  |
| ------ | ------------------------------------------------ | ------------------------------------- |
| 200    | Draft plan successfully generated                | `GenerateDraftPlanResponseDTO`        |
| 400    | Invalid input (schema violation or out-of-range) | `{ error: string }`                   |
| 401    | Authentication failed                            | `{ error: 'Unauthorized' }`           |
| 404    | `city_id` does not exist                         | `{ error: 'City not found' }`         |
| 422    | AI service failed to generate valid plan         | `{ error: 'Unable to generate plan'}` |
| 500    | Unexpected server error                          | `{ error: 'Internal server error'}`   |

## 5. Data Flow

1. **Authentication**: Extract user session via Supabase middleware (`context.locals.supabase.auth.getUser()`).
2. **Validation**: Parse and validate body against Zod schema.
3. **City Check**: Query `public.cities` table to confirm `city_id` exists.
4. **Command Construction**: Map validated data + `userId` into `GenerateDraftPlanCommand`.
5. **Service Invocation**: Call `ItineraryService.generateDraftPlan(command)`:
   - Build prompt payload including `city_id`, `duration_days`, `trip_intensity`, `user_notes`.
   - Create mock of AI reponse.
   - Parse and validate AI response structure.
   - Map to `GenerateDraftPlanResponseDTO`.
6. **Error Logging**:
   - On AI failure or invalid response, insert record into `llm_error_logs` (Supabase) with message, request, optional response, and `user_id`.
7. **Return**: Send 200 with the draft plan or appropriate error code.

## 6. Security Considerations

- **Authentication**: Enforce with Supabase JWT; return 401 if missing or invalid.
- **Authorization**: Only authenticated users may generate plans.
- **Input Sanitization**: Zod schema and manual length limits guard against injection.
- **Rate Limiting**: Consider at API gateway to mitigate abuse of AI calls.
- **Environment Variables**: Store AI API keys in `import.meta.env`.

## 7. Error Handling

| Scenario               | Status | Handling                                                                 |
| ---------------------- | ------ | ------------------------------------------------------------------------ |
| Request schema failure | 400    | Zod throws; catch and return formatted error message                     |
| City not found         | 404    | Return `City not found`                                                  |
| Supabase auth error    | 401    | Return `Unauthorized`                                                    |
| AI HTTP/network error  | 422    | Log to `llm_error_logs`; return `Unable to generate plan`                |
| Unexpected exception   | 500    | Log full stack trace to `app_error_logs`; return `Internal server error` |

## 8. Performance Considerations

- **AI Call Latency**: Parallelize if multiple models; use timeouts (e.g. 10s).
- **Cold Start**: Bundle HTTP client outside handler to avoid reinitialization.
- **Payload Size**: Limit `activities` array length via response validation.

## 9. Implementation Steps

1. **Schemas & Types**: Create `generateRequestSchema` and related Zod types in `src/lib/schemas/plan.schema.ts`.
2. **DTO & Command**: Define DTOs and `GenerateDraftPlanCommand` in `src/types.ts` or a new `src/lib/commands/plan.command.ts`.
3. **AI Client**: Implement `src/lib/services/ai-client.ts` as mock service calling AI
4. **Service**: Create `src/lib/services/itinerary.service.ts` with `generateDraftPlan()`.
5. **Endpoint**: Add `src/pages/api/plans/generate.ts`. Disable prerender (`export const prerender = false`).
6. **Validation & Auth**: In endpoint, get `user` from `context.locals.supabase.auth.getUser()`, validate request.
7. **City Existence**: Query `cities` table via `context.locals.supabase`.
8. **Error Logging**: Implement insertion into `llm_error_logs` and `app_error_logs` as needed.
9. **Documentation**: Update API docs in `README.md` or a dedicated docs folder.

---

_End of implementation plan._
