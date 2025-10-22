import type { SupabaseClient } from "../../db/supabase.client";
import type { Database } from "../../db/database.types";
import type { SavePlanCommand, SavePlanResponseDTO } from "../../types";
import { logAppError, formatErrorMessage, getStackTrace } from "../utils/error-logger";

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
      const { error: activitiesError } = await this.supabase
        .from("plan_activities")
        .insert(activitiesToInsert);

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
}

