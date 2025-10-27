/**
 * Shared types for backend and frontend
 * Entities, DTOs, and Commands
 */

// ===================================
// City Types
// ===================================

/**
 * Data Transfer Object representing a city
 */
export interface CityDto {
  id: string;
  name: string;
}

// ===================================
// Plan Generation Types
// ===================================

/**
 * Request DTO for generating a draft plan
 */
export interface GenerateDraftPlanRequestDTO {
  city_id: string;
  duration_days: number;
  trip_intensity: "full day" | "half day";
  user_notes?: string;
}

/**
 * Command for generating a draft plan (internal use)
 */
export interface GenerateDraftPlanCommand {
  userId: string;
  cityId: string;
  durationDays: number;
  tripIntensity: "full day" | "half day";
  userNotes?: string;
}

/**
 * Activity within a plan
 */
export interface PlanActivityDTO {
  id: string;
  day_number: number;
  position: number;
  name: string;
  latitude: number;
  longitude: number;
  google_maps_url: string;
}

/**
 * Response DTO for draft plan generation
 */
export interface GenerateDraftPlanResponseDTO {
  plan: {
    duration_days: number;
    trip_intensity: "full day" | "half day";
    activities: PlanActivityDTO[];
    disclaimer: string;
  };
}

// ===================================
// Plan Save Types
// ===================================

/**
 * Activity DTO for saving a finalized plan
 */
export interface SavePlanActivityDTO {
  day_number: number;
  position: number;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string;
  google_maps_url?: string | null;
}

/**
 * Request DTO for saving a finalized plan
 */
export interface SavePlanRequestDTO {
  city_id: string;
  duration_days: number;
  trip_intensity: "full day" | "half day";
  user_notes?: string;
  activities: SavePlanActivityDTO[];
}

/**
 * Command for saving a finalized plan (internal use)
 */
export interface SavePlanCommand {
  userId: string;
  cityId: string;
  durationDays: number;
  tripIntensity: "full day" | "half day";
  userNotes?: string;
  activities: SavePlanActivityDTO[];
}

/**
 * Response DTO for saved plan
 */
export interface SavePlanResponseDTO {
  id: string;
  status: "active" | "draft" | "archived";
  created_at: string;
  updated_at: string;
}

// ===================================
// Plan List Types
// ===================================

/**
 * Data Transfer Object representing a plan summary
 */
export interface PlanDto {
  id: string;
  city_id: string;
  duration_days: number;
  trip_intensity: "full day" | "half day";
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface PlanWithActivitiesDto {
  plan: PlanDto;
  activities: PlanActivityDTO[];
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationDto {
  page: number;
  page_size: number;
  total: number;
}

/**
 * Response DTO for listing plans
 */
export interface ListPlansResponseDto {
  data: PlanDto[];
  pagination: PaginationDto;
}

// ===================================
// Error Response Types
// ===================================

export interface ErrorResponseDTO {
  error: string;
}
