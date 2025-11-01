/**
 * API Client for frontend
 * Handles API calls with error handling and type safety
 */

import type { CityDto, ListPlansResponseDto, PlanWithActivitiesDto } from "../types";

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
