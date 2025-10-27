/**
 * Custom hook for managing plan data, pagination, and state
 */

import { useState, useEffect, useCallback } from "react";
import { fetchPlans } from "../../lib/api-client";
import type { PlanDto } from "../../types";
import type { PlanViewModel, PaginationState } from "./types";

/**
 * Transforms PlanDto to PlanViewModel with city name lookup and formatted strings
 */
function transformPlanToViewModel(plan: PlanDto): PlanViewModel {
  const displayDuration = `${plan.duration_days} Day${plan.duration_days > 1 ? "s" : ""} Trip`;

  const createdDate = new Date(plan.created_at);
  const displayCreatedAt = `Created on ${createdDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  return {
    id: plan.id,
    cityName: plan.city.name,
    durationDays: plan.duration_days,
    displayDuration,
    displayCreatedAt,
    tripIntensity: plan.trip_intensity,
    status: plan.status,
  };
}

interface UsePlansState {
  plans: PlanViewModel[];
  isLoading: boolean;
  isFetchingMore: boolean;
  error: string | null;
  hasMore: boolean;
  pagination: PaginationState;
}

const INITIAL_STATE: UsePlansState = {
  plans: [],
  isLoading: true,
  isFetchingMore: false,
  error: null,
  hasMore: true,
  pagination: {
    page: 1,
    pageSize: 12,
    total: 0,
    hasMore: true,
  },
};

/**
 * Custom hook for managing user plans
 * Handles fetching cities, fetching plans with pagination, and state management
 *
 * @returns Object containing plans data, loading states, error info, and loadMore function
 */
export function usePlans() {
  const [state, setState] = useState<UsePlansState>(INITIAL_STATE);

  /**
   * Initialize: Fetch cities and first page of plans
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        setState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
        }));

        // Fetch first page of plans
        const response = await fetchPlans(1, 12);

        const viewModels = response.data.map((plan) => transformPlanToViewModel(plan));
        const hasMore = response.pagination.page * response.pagination.page_size < response.pagination.total;

        setState((prev) => ({
          ...prev,
          plans: viewModels,
          isLoading: false,
          hasMore,
          pagination: {
            page: response.pagination.page,
            pageSize: response.pagination.page_size,
            total: response.pagination.total,
            hasMore,
          },
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load plans";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    };

    initialize();
  }, []);

  /**
   * Load more plans (triggered by infinite scroll)
   */
  const loadMore = useCallback(async () => {
    if (state.isFetchingMore || !state.hasMore) {
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        isFetchingMore: true,
      }));

      const nextPage = state.pagination.page + 1;
      const response = await fetchPlans(nextPage, state.pagination.pageSize);

      const viewModels = response.data.map((plan) => transformPlanToViewModel(plan));
      const hasMore = response.pagination.page * response.pagination.page_size < response.pagination.total;

      setState((prev) => ({
        ...prev,
        plans: [...prev.plans, ...viewModels],
        isFetchingMore: false,
        hasMore,
        pagination: {
          page: response.pagination.page,
          pageSize: response.pagination.page_size,
          total: response.pagination.total,
          hasMore,
        },
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load more plans";
      setState((prev) => ({
        ...prev,
        isFetchingMore: false,
        error: errorMessage,
      }));
    }
  }, [state.isFetchingMore, state.hasMore, state.pagination]);

  return {
    plans: state.plans,
    isLoading: state.isLoading,
    isFetchingMore: state.isFetchingMore,
    error: state.error,
    hasMore: state.hasMore,
    loadMore,
  };
}
