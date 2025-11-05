/**
 * API Client for frontend
 * Handles API calls with error handling and type safety
 */

import type {
  CityDto,
  ListPlansResponseDto,
  PlanWithActivitiesDto,
  GenerateDraftPlanRequestDTO,
  SavePlanRequestDTO,
  SavePlanResponseDTO,
  SubmitFeedbackRequestDTO,
  SubmitFeedbackResponseDTO,
  UpdatePlanRequestDTO,
} from "../types";

/**
 * Configuration for API calls
 */
const API_BASE = "";
const DEFAULT_PAGE_SIZE = 12;

/**
 * Fetch all available cities
 * @returns Promise<CityDto[]> - Array of cities
 * @throws Error if the API call fails
 */
export async function fetchCities(): Promise<CityDto[]> {
  try {
    const response = await fetch(`${API_BASE}/api/cities`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cities: ${response.status} ${response.statusText}`);
    }

    const cities: CityDto[] = await response.json();
    return cities;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching cities:", error);
    throw error;
  }
}

/**
 * Fetch paginated list of user plans
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page (default: 12)
 * @returns Promise<ListPlansResponseDto> - Paginated list of plans
 * @throws Error if the API call fails
 */
export async function fetchPlans(page = 1, pageSize: number = DEFAULT_PAGE_SIZE): Promise<ListPlansResponseDto> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      sort: "created_at",
    });

    const response = await fetch(`${API_BASE}/api/plans?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch plans: ${response.status} ${response.statusText}`);
    }

    const data: ListPlansResponseDto = await response.json();
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching plans:", error);
    throw error;
  }
}

/**
 * Fetch a single plan with activities by ID
 * @param planId - The ID of the plan to fetch
 * @returns Promise<PlanWithActivitiesDto> - Plan with associated activities
 * @throws Error if the API call fails or plan is not found
 */
export async function fetchPlanById(planId: string): Promise<PlanWithActivitiesDto> {
  if (!planId || typeof planId !== "string") {
    throw new Error("Invalid plan ID");
  }

  try {
    const response = await fetch(`${API_BASE}/api/plans/${planId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Plan not found");
      }
      if (response.status === 403) {
        throw new Error("Access denied");
      }
      throw new Error(`Failed to fetch plan: ${response.status} ${response.statusText}`);
    }

    const planWithActivities: PlanWithActivitiesDto = await response.json();
    return planWithActivities;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching plan:", error);
    throw error;
  }
}

/**
 * Delete a plan by archiving it (soft delete)
 * @param planId - The ID of the plan to archive
 * @returns Promise<void>
 * @throws Error if the API call fails
 */
export async function deletePlan(planId: string): Promise<void> {
  if (!planId || typeof planId !== "string") {
    throw new Error("Invalid plan ID");
  }

  try {
    const response = await fetch(`${API_BASE}/api/plans/${planId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Plan not found");
      }
      if (response.status === 403) {
        throw new Error("Access denied");
      }
      throw new Error(`Failed to delete plan: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting plan:", error);
    throw error;
  }
}

/**
 * Generate a draft plan based on user input
 * @param request - Plan generation request parameters
 * @returns Promise<PlanWithActivitiesDto> - Generated plan with activities
 * @throws Error if the API call fails
 */
export async function generatePlan(request: GenerateDraftPlanRequestDTO): Promise<PlanWithActivitiesDto> {
  if (!request.city_id || !request.duration_days || !request.trip_intensity) {
    throw new Error("Missing required fields for plan generation");
  }

  try {
    const response = await fetch(`${API_BASE}/api/plans/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: string };

      if (response.status === 400) {
        throw new Error(`Invalid input: ${errorData.error || "Please check your parameters"}`);
      }
      if (response.status === 422) {
        throw new Error("Could not generate a plan with these options. Please try adjusting them.");
      }
      if (response.status === 500) {
        throw new Error("An unexpected error occurred. Please try again later.");
      }
      throw new Error(`Failed to generate plan: ${response.status} ${response.statusText}`);
    }

    const result = (await response.json()) as PlanWithActivitiesDto;
    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error generating plan:", error);
    throw error;
  }
}

/**
 * Save a finalized plan
 * @param request - Plan save request with activities
 * @returns Promise<SavePlanResponseDTO> - Saved plan response
 * @throws Error if the API call fails
 */
export async function savePlan(request: SavePlanRequestDTO): Promise<SavePlanResponseDTO> {
  if (!request.city_id || !request.duration_days || !request.trip_intensity) {
    throw new Error("Missing required fields for plan save");
  }

  try {
    const response = await fetch(`${API_BASE}/api/plans/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: string };

      if (response.status === 400) {
        throw new Error(`Invalid plan data: ${errorData.error || "Please check your plan and try again"}`);
      }
      if (response.status === 500) {
        throw new Error("An unexpected error occurred while saving. Please try again.");
      }
      throw new Error(`Failed to save plan: ${response.status} ${response.statusText}`);
    }

    const result = (await response.json()) as SavePlanResponseDTO;
    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error saving plan:", error);
    throw error;
  }
}

/**
 * Get feedback status for a plan
 * @param planId - The ID of the plan
 * @returns Promise<{hasFeedback: boolean}> - Feedback status
 * @throws Error if the API call fails
 */
export async function getFeedbackStatus(planId: string): Promise<{ hasFeedback: boolean }> {
  if (!planId || typeof planId !== "string") {
    throw new Error("Invalid plan ID");
  }

  try {
    const response = await fetch(`${API_BASE}/api/plans/${planId}/feedback`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Plan not found");
      }
      throw new Error(`Failed to fetch feedback status: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { hasFeedback: boolean };
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching feedback status:", error);
    throw error;
  }
}

/**
 * Submit feedback for a plan
 * @param planId - The ID of the plan
 * @param request - Feedback submission request
 * @returns Promise<SubmitFeedbackResponseDTO> - Feedback response
 * @throws Error if the API call fails
 */
export async function submitFeedback(
  planId: string,
  request: SubmitFeedbackRequestDTO
): Promise<SubmitFeedbackResponseDTO> {
  if (!planId || typeof planId !== "string") {
    throw new Error("Invalid plan ID");
  }

  if (typeof request.helpful !== "boolean") {
    throw new Error("Invalid feedback data");
  }

  try {
    const response = await fetch(`${API_BASE}/api/plans/${planId}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: string };

      if (response.status === 403) {
        throw new Error("Feedback already submitted for this plan");
      }
      if (response.status === 404) {
        throw new Error("Plan not found");
      }
      if (response.status === 400) {
        throw new Error(errorData.error || "Invalid feedback data");
      }
      throw new Error(`Failed to submit feedback: ${response.status} ${response.statusText}`);
    }

    const result = (await response.json()) as SubmitFeedbackResponseDTO;
    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error submitting feedback:", error);
    throw error;
  }
}

/**
 * Update a plan by reordering or reassigning activities to different days
 * @param planId - The ID of the plan to update
 * @param request - Plan update request with activities
 * @returns Promise<void>
 * @throws Error if the API call fails
 */
export async function updatePlan(planId: string, request: UpdatePlanRequestDTO): Promise<void> {
  if (!planId || typeof planId !== "string") {
    throw new Error("Invalid plan ID");
  }

  if (!request.activities || request.activities.length === 0) {
    throw new Error("At least one activity is required");
  }

  try {
    const response = await fetch(`${API_BASE}/api/plans/${planId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: string };

      if (response.status === 400) {
        throw new Error(`Invalid plan data: ${errorData.error || "Please check your plan and try again"}`);
      }
      if (response.status === 404) {
        throw new Error("Plan not found");
      }
      if (response.status === 403) {
        throw new Error("Access denied");
      }
      throw new Error(`Failed to update plan: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating plan:", error);
    throw error;
  }
}

/**
 * Login user with email and password
 * @param email - User email
 * @param password - User password
 * @returns Promise<void> - Redirects on success
 * @throws Error if the API call fails
 */
export async function loginUser(email: string, password: string): Promise<void> {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: string };
      throw new Error(errorData.error || "An error occurred during login. Please try again.");
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error logging in:", error);
    throw error;
  }
}
