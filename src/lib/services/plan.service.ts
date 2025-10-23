import type { SupabaseClient } from "../../db/supabase.client";
import type { SavePlanCommand, SavePlanResponseDTO, PlanDto } from "../../types";
import { logAppError, formatErrorMessage, getStackTrace } from "../utils/error-logger";

/**
 * Query interface for listing plans
 */
export interface ListPlansQuery {
  page: number;
  pageSize: number;
  sort: string;
  userId: string;
}

/**
 * Service for managing travel plans
 */
export class PlanService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Saves a finalized travel plan with its activities
   * @param command - Command containing plan and activity data
   * @returns Response with plan ID and metadata
   * @throws Error if plan or activities cannot be saved
   */
  async saveFinalPlan(command: SavePlanCommand): Promise<SavePlanResponseDTO> {
    try {
      // Step 1: Insert the plan record
      const { data: planData, error: planError } = await this.supabase
        .from("plans")
        .insert({
          user_id: command.userId,
          city_id: command.cityId,
          duration_days: command.durationDays,
          trip_intensity: command.tripIntensity,
          wizard_notes: command.userNotes || null,
          status: "active",
          is_archived: false,
        })
        .select("id, status, created_at, updated_at")
        .single();

      if (planError) {
        await logAppError(this.supabase, {
          userId: command.userId,
          message: `Failed to insert plan: ${planError.message}`,
          severity: "error",
          stackTrace: planError.stack,
          payload: { command, error: planError },
        });
        throw new Error(`Failed to create plan: ${planError.message}`);
      }

      if (!planData) {
        throw new Error("Plan was created but no data was returned");
      }

      // Step 2: Prepare activities for bulk insert
      const activitiesToInsert = command.activities.map((activity) => ({
        plan_id: planData.id,
        day_number: activity.day_number,
        position: activity.position,
        name: activity.name,
        latitude: activity.latitude ?? null,
        longitude: activity.longitude ?? null,
        notes: activity.notes || null,
      }));

      // Step 3: Bulk insert activities
      const { error: activitiesError } = await this.supabase.from("plan_activities").insert(activitiesToInsert);

      if (activitiesError) {
        // Log error with plan context
        await logAppError(this.supabase, {
          userId: command.userId,
          planId: planData.id,
          message: `Failed to insert activities for plan: ${activitiesError.message}`,
          severity: "error",
          stackTrace: activitiesError.stack,
          payload: { command, planId: planData.id, error: activitiesError },
        });

        // Note: In a true transaction, we would rollback the plan insert here
        // For now, we throw an error. Consider implementing a cleanup mechanism
        // or using a Supabase RPC function for atomic operations
        throw new Error(`Failed to save activities: ${activitiesError.message}`);
      }

      // Step 4: Return success response
      return {
        id: planData.id,
        status: planData.status as "active" | "draft" | "archived",
        created_at: planData.created_at,
        updated_at: planData.updated_at,
      };
    } catch (error) {
      // Log unexpected errors
      await logAppError(this.supabase, {
        userId: command.userId,
        message: `Unexpected error in saveFinalPlan: ${formatErrorMessage(error)}`,
        severity: "error",
        stackTrace: getStackTrace(error),
        payload: { command },
      });

      // Re-throw for endpoint to handle
      throw error;
    }
  }

  /**
   * Retrieves a paginated list of plans for a specific user
   * @param query - Query parameters for pagination and sorting
   * @returns Object containing plans array and total count
   * @throws Error if plans cannot be fetched
   */
  async listUserPlans(query: ListPlansQuery): Promise<{ plans: PlanDto[]; total: number }> {
    try {
      // Calculate pagination range
      const from = (query.page - 1) * query.pageSize;
      const to = from + query.pageSize - 1;

      // Fetch plans with pagination and sorting
      const { data: plansData, error: plansError } = await this.supabase
        .from("plans")
        .select("id, city_id, duration_days, trip_intensity, status, created_at, updated_at")
        .eq("user_id", query.userId)
        .order(query.sort, { ascending: false })
        .range(from, to);

      if (plansError) {
        await logAppError(this.supabase, {
          userId: query.userId,
          message: `Failed to fetch plans: ${plansError.message}`,
          severity: "error",
          stackTrace: plansError.stack,
          payload: { query, error: plansError },
        });
        throw new Error(`Failed to fetch plans: ${plansError.message}`);
      }

      // Get total count for pagination
      const { count, error: countError } = await this.supabase
        .from("plans")
        .select("*", { count: "exact", head: true })
        .eq("user_id", query.userId);

      if (countError) {
        await logAppError(this.supabase, {
          userId: query.userId,
          message: `Failed to count plans: ${countError.message}`,
          severity: "error",
          stackTrace: countError.stack,
          payload: { query, error: countError },
        });
        throw new Error(`Failed to count plans: ${countError.message}`);
      }

      // Map database rows to DTOs
      const plans: PlanDto[] = (plansData || []).map((row) => ({
        id: row.id,
        city_id: row.city_id,
        duration_days: row.duration_days,
        trip_intensity: row.trip_intensity as "full day" | "half day",
        status: row.status as "draft" | "active" | "archived",
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      return {
        plans,
        total: count || 0,
      };
    } catch (error) {
      // Log unexpected errors
      await logAppError(this.supabase, {
        userId: query.userId,
        message: `Unexpected error in listUserPlans: ${formatErrorMessage(error)}`,
        severity: "error",
        stackTrace: getStackTrace(error),
        payload: { query },
      });

      // Re-throw for endpoint to handle
      throw error;
    }
  }
}
