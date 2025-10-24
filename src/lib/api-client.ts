/**
 * API Client for frontend
 * Handles API calls with error handling and type safety
 */

import type { CityDto, ListPlansResponseDto } from "../types";

/**
 * Configuration for API calls
 */
const API_BASE = "";
const DEFAULT_PAGE_SIZE = 12;

/**
 * Error handler for API responses
 * Redirects to login on 401 Unauthorized
 */
function handleAuthError(status: number): void {
  if (status === 401) {
    // TODO: Implement auth redirect
    //window.location.href = "/login";
    console.log("Unauthorized");
    return;
  }
}

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
      handleAuthError(response.status);
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
      handleAuthError(response.status);
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
