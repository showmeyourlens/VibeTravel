# API Endpoint Implementation Plan: POST /plans/generate

## 1. Endpoint Overview
This document outlines the implementation plan for the `POST /api/plans/generate` endpoint. The purpose of this endpoint is to generate a draft travel itinerary using an external AI service. The generated plan is not persisted to the database and is intended for immediate review by the user.

## 2. Request Details
- **HTTP Method:** `POST`
- **URL Structure:** `/api/plans/generate`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <SUPABASE_JWT>` (Handled by client)
- **Request Body:**

```json
{
  "city_id": "UUID",
  "duration_days": "integer",
  "trip_intensity": "'full day' | 'half day'",
  "user_notes": "string (optional)"
}
```

- **Parameters:**
  - **Required:** `city_id`, `duration_days`, `trip_intensity`
  - **Optional:** `user_notes`

## 3. Used Types
The implementation will use the following pre-defined types from `src/types.ts`:
- **Request DTO:** `GenerateDraftPlanRequestDTO`
- **Command Model:** `GenerateDraftPlanCommand`
- **Response DTO:** `GenerateDraftPlanResponseDTO`

## 4. Response Details
### Successful Response (200 OK)
The server responds with a JSON object containing the generated plan details.

```json
{
  "plan": {
    "duration_days": 3,
    "trip_intensity": "full day",
    "activities": [
      {
        "day_number": 1,
        "position": 1,
        "name": "Louvre Museum",
        "latitude": 48.8606,
        "longitude": 2.3376,
        "google_maps_url": "https://maps.google.com/?q=48.8606,2.3376"
      }
    ],
    "disclaimer": "Please verify opening hours independently."
  }
}
```
### Error Responses
- **400 Bad Request:** Returned when the request body fails validation (e.g., invalid data types, missing fields, `duration_days` out of range) or the `city_id` does not exist.
- **401 Unauthorized:** Returned if the request lacks a valid authentication token.
- **422 Unprocessable Entity:** Returned if the AI service fails to generate a valid itinerary or if its response cannot be parsed.
- **500 Internal Server Error:** Returned for any unexpected server-side errors.

## 5. Data Flow
1. The client sends a `POST` request to `/api/plans/generate` with user preferences.
2. Astro's middleware (`src/middleware/index.ts`) intercepts the request to validate the user's session using the Supabase JWT.
3. The API route handler (`src/pages/api/plans/generate.ts`) receives the request.
4. The handler validates the request body against a Zod schema defined in `src/lib/schemas/plan.schema.ts`.
5. The handler performs a database lookup to confirm the existence of the provided `city_id`.
6. The request DTO is mapped to the `GenerateDraftPlanCommand`, including the `userId` from the session.
7. The handler invokes `ItineraryService.generateDraftItinerary(command)`.
8. The `ItineraryService` fetches the city name from the database to enrich the AI prompt.
9. The service constructs a detailed prompt and sends it to the AI model via the `AIClient`.
10. The service receives, parses, and validates the AI model's response.
11. The service returns the structured plan data (`GenerateDraftPlanResponseDTO`) to the route handler.
12. The handler serializes the DTO to JSON and sends it back to the client with a 200 OK status.

## 6. Security Considerations
- **Authentication:** Access is restricted to authenticated users. The middleware must deny requests without a valid session.
- **Input Validation:** All incoming data will be strictly validated using Zod to prevent malformed data from being processed. The `user_notes` field will have a character limit to mitigate prompt injection risks.
- **Rate Limiting:** To prevent abuse of the expensive AI service, rate limiting should be implemented on this endpoint (e.g., using a service like Upstash). This is a crucial step to control costs and ensure service availability.

## 7. Error Handling
- A global `try...catch` block will be used in the API route handler.
- **Validation Errors:** Zod validation errors will be caught, logged, and will result in a 400 response with a clear error message.
- **AI Service Errors:** Errors originating from the `AIClient` or response parsing will be caught, logged, and result in a 422 response.
- **Server Errors:** Any other exceptions will be caught, logged via `ErrorLogger`, and will result in a generic 500 response to avoid exposing internal implementation details.

## 8. Performance Considerations
- The primary performance bottleneck is the response time of the external AI service. The frontend client must implement a robust loading state to manage this latency and provide a good user experience.
- Database queries (e.g., fetching city details) should be optimized and properly indexed to ensure they are fast.

## 9. Implementation Steps
1.  **Create Zod Schema:**
    -   In `src/lib/schemas/plan.schema.ts`, define a new Zod schema named `generateDraftPlanRequestSchema` that validates the structure and constraints of `GenerateDraftPlanRequestDTO`.

2.  **Update Itinerary Service:**
    -   In `src/pages/api/services/itinerary.service.ts`, create a new public method: `public async generateDraftItinerary(command: GenerateDraftPlanCommand): Promise<GenerateDraftPlanResponseDTO>`.
    -   This method will contain the core logic:
        -   Fetch city details from the database using `command.cityId`.
        -   Construct a detailed prompt for the AI model.
        -   Call the `AIClient` to get the itinerary.
        -   Parse and validate the AI response, throwing a specific error if parsing fails.
        -   Format the data into the `GenerateDraftPlanResponseDTO` structure and return it.

3.  **Implement API Route:**
    -   In `src/pages/api/plans/generate.ts`, implement the `POST` handler function.
    -   Set `export const prerender = false;`.
    -   Use `context.locals` to get the authenticated user and Supabase client instance. Return a 401 response if the user is not authenticated.
    -   Use the `generateDraftPlanRequestSchema` to parse and validate the incoming request body.
    -   Verify that the `city_id` from the request exists in the `cities` table.
    -   Instantiate and call the `ItineraryService.generateDraftItinerary` method.
    -   Wrap the service call in a `try...catch` block to handle errors gracefully, returning appropriate 4xx/5xx status codes.
    -   On success, return the response from the service with a 200 status code.

---

## 10. Implementation Status - COMPLETED

### AI Client Implementation (src/pages/api/services/ai-client.ts)

The AI Client has been fully implemented with real OpenRouter.ai integration.

#### Architecture
- Constructor: Validates OPENROUTER_API_KEY environment variable on initialization
- Singleton Pattern: Single instance exported for use throughout the application
- Error Handling: Comprehensive error handling with meaningful error messages

#### Core Features
1. Real OpenRouter API integration with proper authentication
2. Structured prompt generation with exact activity specifications
3. JSON response parsing with validation
4. Coordinate-based Google Maps URL generation
5. Comprehensive error handling and logging

#### Configuration
- Model: meta-llama/llama-2-70b-chat
- Temperature: 0.7 (balanced creativity)
- Max tokens: 2000
- Timeout: 30 seconds
- API: https://openrouter.ai/api/v1/chat/completions

#### Environment Requirements
- OPENROUTER_API_KEY: Required for API authentication
- SITE: Optional for HTTP-Referer header

_Implementation Complete_
