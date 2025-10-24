/**
 * Dashboard View Models and Types
 */

/**
 * ViewModel for displaying a plan in the dashboard
 * Aggregates data from PlanDto and city lookup
 */
export interface PlanViewModel {
  id: string;
  cityName: string;
  durationDays: number;
  displayDuration: string;
  displayCreatedAt: string;
  tripIntensity: "full day" | "half day";
  status: "draft" | "active" | "archived";
}

/**
 * Pagination state for managing infinite scroll
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}
