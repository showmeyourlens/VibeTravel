# REST API Plan

## 1. Resources

- **cities** (backed by `cities` table)
- **plans** (backed by `plans` table)
- **plan_activities** (nested in `plans`)
- **plan_feedback** (nested in `plans`)
- **auth** (Supabase-managed endpoints for user registration & login)

## 2. Endpoints

### 2.2 Lookup

#### GET /cities

List available destination cities.  
Query parameters: _none_  
Response (200 OK):

```json
[
  { "id": "UUID", "name": "Paris" },
  { "id": "UUID", "name": "Rome" },
  …
]
```

Errors: – none

### 2.3 Itinerary Generation

#### POST /plans/generate

Generate a draft itinerary via AI (no persistence).  
Request:

```json
{
  "city_id": "UUID",
  "duration_days": 3,
  "trip_intensity": "full day",
  "user_notes": "I love art and history."
}
```

Response (200 OK):

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
      },
      …
    ],
    "disclaimer": "Please verify opening hours independently."
  }
}
```

Errors:

- 400 Bad Request – invalid inputs (e.g. duration_days out of range)
- 422 Unprocessable Entity – AI model failed to generate (triggers user-friendly message)

### 2.4 Plan Management

#### POST /plans

Save a finalized plan (with any reorders/deletions).  
Request:

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
    },
    …
  ]
}
```

Response (201 Created):

```json
{
  "id": "UUID",
  "status": "active",
  "created_at": "2025-10-17T12:34:56Z",
  "updated_at": "2025-10-17T12:34:56Z"
}
```

Errors:

- 400 Bad Request – validation failure (e.g., duration_days, day_number > duration_days)
- 401 Unauthorized – missing or invalid JWT

#### GET /plans

List the current user’s saved plans.  
Query parameters:

- `page` (int, default 1)
- `page_size` (int, default 20)
- `sort` (e.g. `created_at`, default `created_at`)  
  Response (200 OK):

```json
{
  "data": [
    { "id": "UUID", "city_id": "UUID", "duration_days": 3, "trip_intensity": "full day", "status": "active", "created_at": "...", "updated_at": "..." },
    …
  ],
  "pagination": { "page": 1, "page_size": 20, "total": 42 }
}
```

Errors:

- 401 Unauthorized

#### GET /plans/{planId}

Retrieve a single plan with activities.  
Response (200 OK):

```json
{
  "id": "UUID",
  "city_id": "UUID",
  "duration_days": 3,
  "trip_intensity": "full day",
  "wizard_notes": "…",
  "status": "active",
  "is_archived": false,
  "activities": [
    { "id": "UUID", "day_number": 1, "position": 1, "name": "…", "latitude":…, "longitude":…, "notes":"…" },
    …
  ]
}
```

Errors:

- 401 Unauthorized
- 403 Forbidden – accessing another user’s plan
- 404 Not Found – no such plan

#### PATCH /plans/{planId}

Update plan metadata or activities (reorders/deletions).  
Request (any subset of fields):

```json
{
  "activities": [
    { "id": "UUID", "day_number": 1, "position": 2 },
    { "id": "UUID", "day_number": 1, "position": 1 },
    …
  ]
}
```

Response (200 OK):

```json
{ "message": "Plan updated successfully." }
```

Errors:

- 400 Bad Request – validation errors (e.g. duplicate position per day)
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

#### DELETE /plans/{planId}

Soft-archive a plan (set `is_archived = true`).  
Response (204 No Content)  
Errors:

- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

### 2.5 Feedback

#### POST /plans/{planId}/feedback

Submit “Was this plan helpful?” response.  
Request:

```json
{ "helpful": true }
```

Response (201 Created):

```json
{ "id": "UUID", "created_at": "…" }
```

Errors:

- 400 Bad Request – missing/invalid boolean
- 401 Unauthorized
- 403 Forbidden – if feedback already exists
- 404 Not Found

## 4. Validation and Business Logic

### Validation Rules

- `duration_days`: integer in [1,5].
- `trip_intensity`: one of `full day`, `half day`.
- `activities[].day_number`: ≥1 and ≤ `duration_days`.
- Unique `(plan_id, day_number, position)` for activities.
- One feedback per user per plan (`UNIQUE(plan_id, user_id)`).

### Business Logic Implementation

- **Itinerary Generation**:
  - `/plans/generate` calls Openrouter.ai, transforms response into structured `activities`.
  - Validates inputs before calling AI.
  - On AI failure, returns 422 with user-friendly message.
- **Plan Persistence**:
  - `/plans` writes `plans` + nested `activities` in one transaction.
- **Reordering/Deletion**:
  - Client sends updated `activities` array; server applies position/day updates within same transaction.
- **Soft-Deletion**:
  - `DELETE /plans/{id}` sets `is_archived`.
- **Feedback Recording**:
  - `/plans/{id}/feedback` allows user to vote if plan was helpful of not.
- **Pagination & Sorting**:
  - Leverage DB index `idx_plans_user_created` for efficient listing sorted by `created_at`.
- **Rate Limiting** (assumption):
  - Apply per-user rate limit on `/plans/generate` to prevent AI abuse (e.g. 10 requests/min).
