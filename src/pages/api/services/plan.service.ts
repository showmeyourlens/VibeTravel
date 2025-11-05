import type { SupabaseClient } from "../../../db/supabase.client";
import type {
  SavePlanCommand,
  SavePlanResponseDTO,
  PlanDto,
  PlanWithActivitiesDto,
  UpdatePlanCommand,
} from "../../../types";
import { logAppError, formatErrorMessage, getStackTrace } from "../../../lib/utils/error-logger";

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
        google_maps_url: activity.google_maps_url || null,
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
        .select("id, duration_days, trip_intensity, status, created_at, updated_at, city:cities (id, name)")
        .eq("user_id", query.userId)
        .eq("is_archived", false)
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
        city: row.city,
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

  /**
   * Retrieves a paginated list of plans for a specific user
   * @param query - Query parameters for pagination and sorting
   * @returns Object containing plans array and total count
   * @throws Error if plans cannot be fetched
   */
  async getPlanWithActivitiesById(planId: string, userId: string): Promise<PlanWithActivitiesDto> {
    try {
      // Fetch plan with activities
      const { data: planWithActivitiesData, error: planWithActivitiesError } = await this.supabase
        .from("plans")
        .select(
          "id, duration_days, trip_intensity, status, created_at, updated_at, plan_activities(*), city:cities (id, name)"
        )
        .eq("id", planId)
        .eq("is_archived", false)
        .single();

      if (planWithActivitiesError) {
        await logAppError(this.supabase, {
          userId: userId,
          message: `Failed to fetch plans: ${planWithActivitiesError.message}`,
          severity: "error",
          stackTrace: planWithActivitiesError.stack,
          payload: { error: planWithActivitiesError },
        });
        throw new Error(`Failed to fetch plan ${planId} with activities: ${planWithActivitiesError.message}`);
      }

      // Map database rows to DTOs
      const planWithActivities: PlanWithActivitiesDto = {
        plan: {
          id: planWithActivitiesData.id,
          city: planWithActivitiesData.city,
          duration_days: planWithActivitiesData.duration_days,
          trip_intensity: planWithActivitiesData.trip_intensity as "full day" | "half day",
          status: planWithActivitiesData.status as "draft" | "active" | "archived",
          created_at: planWithActivitiesData.created_at,
          updated_at: planWithActivitiesData.updated_at,
        },
        activities: planWithActivitiesData.plan_activities.map((activity) => ({
          id: activity.id,
          day_number: activity.day_number,
          position: activity.position,
          name: activity.name,
          latitude: activity.latitude ?? 0,
          longitude: activity.longitude ?? 0,
          google_maps_url: activity.google_maps_url as string,
        })),
      };

      return planWithActivities;
    } catch (error) {
      // Log unexpected errors
      await logAppError(this.supabase, {
        userId: userId,
        message: `Unexpected error in getPlanWithActivitiesById: ${formatErrorMessage(error)}`,
        severity: "error",
        stackTrace: getStackTrace(error),
      });

      // Re-throw for endpoint to handle
      throw error;
    }
  }

  /**
   * Checks if user has already provided feedback for a plan
   * @param planId - Plan ID to check
   * @param userId - User ID checking feedback status
   * @returns true if feedback exists, false otherwise
   * @throws Error if check fails
   */
  async hasFeedback(planId: string, userId: string): Promise<boolean> {
    try {
      const { data: feedback, error: feedbackError } = await this.supabase
        .from("plan_feedback")
        .select("id")
        .eq("plan_id", planId)
        .eq("user_id", userId)
        .single();

      // PGRST116 error means no row found, which is expected
      if (feedbackError?.code === "PGRST116") {
        return false;
      }

      if (feedbackError) {
        await logAppError(this.supabase, {
          userId: userId,
          planId,
          message: `Failed to check feedback status: ${feedbackError.message}`,
          severity: "error",
          stackTrace: feedbackError.stack,
          payload: { feedbackError },
        });
        throw new Error(`Failed to check feedback: ${feedbackError.message}`);
      }

      return !!feedback;
    } catch (error) {
      await logAppError(this.supabase, {
        userId: userId,
        planId,
        message: `Unexpected error in hasFeedback: ${formatErrorMessage(error)}`,
        severity: "error",
        stackTrace: getStackTrace(error),
      });

      throw error;
    }
  }

  /**
   * Archives a plan by setting is_archived to true
   * @param planId - Plan ID to archive
   * @returns void
   * @throws Error if plan cannot be archived
   */
  async archivePlan(planId: string): Promise<void> {
    try {
      const { error: updateError } = await this.supabase.from("plans").update({ is_archived: true }).eq("id", planId);

      if (updateError) {
        await logAppError(this.supabase, {
          planId,
          message: `Failed to archive plan: ${updateError.message}`,
          severity: "error",
          stackTrace: updateError.stack,
          payload: { error: updateError },
        });
        throw new Error(`Failed to archive plan: ${updateError.message}`);
      }
    } catch (error) {
      // Log unexpected errors
      await logAppError(this.supabase, {
        planId,
        message: `Unexpected error in archivePlan: ${formatErrorMessage(error)}`,
        severity: "error",
        stackTrace: getStackTrace(error),
      });

      throw error;
    }
  }

  /**
   * Updates a plan's activities (day_number and position)
   * @param command - Command containing plan ID, user ID, and activities to update
   * @returns void
   * @throws Error if update fails or activities don't belong to the plan
   */
  async updatePlan(command: UpdatePlanCommand): Promise<void> {
    try {
      // Guard: Check that at least one update field is provided
      if (!command.activities || command.activities.length === 0) {
        throw new Error("No updates provided. At least one activity must be specified.");
      }

      // Guard: Validate that all positions within a day are unique
      const dayPositionMap = new Map<number, Set<number>>();
      for (const activity of command.activities) {
        if (!dayPositionMap.has(activity.dayNumber)) {
          dayPositionMap.set(activity.dayNumber, new Set());
        }
        const positions = dayPositionMap.get(activity.dayNumber);
        if (!positions) {
          throw new Error("Internal error: positions map entry was deleted");
        }
        if (positions.has(activity.position)) {
          await logAppError(this.supabase, {
            userId: command.userId,
            planId: command.planId,
            message: "Duplicate activity position within a day",
            severity: "warning",
            payload: { command },
          });
          throw new Error(`Duplicate position ${activity.position} on day ${activity.dayNumber}`);
        }
        positions.add(activity.position);
      }

      // Step 1: Begin transaction - update each activity
      // Note: Supabase doesn't have native transaction support in JS client,
      // so we perform updates sequentially and rely on RLS for authorization
      for (const activity of command.activities) {
        const { error: updateError } = await this.supabase
          .from("plan_activities")
          .update({
            day_number: activity.dayNumber,
            position: activity.position,
            google_maps_url: null,
          })
          .eq("id", activity.id)
          .eq("plan_id", command.planId);

        if (updateError) {
          // Check if error is due to RLS (unauthorized access)
          if (updateError.code === "PGRST201" || updateError.message.includes("failed")) {
            await logAppError(this.supabase, {
              userId: command.userId,
              planId: command.planId,
              message: `Activity not found or unauthorized: ${updateError.message}`,
              severity: "warning",
              payload: { command, error: updateError },
            });
            throw new Error(`Activity ${activity.id} not found or access denied`);
          }

          await logAppError(this.supabase, {
            userId: command.userId,
            planId: command.planId,
            message: `Failed to update activity: ${updateError.message}`,
            severity: "error",
            stackTrace: updateError.stack,
            payload: { command, error: updateError },
          });
          throw new Error(`Failed to update activity ${activity.id}: ${updateError.message}`);
        }
      }

      // Step 2: Update plan's updated_at timestamp
      const { error: planUpdateError } = await this.supabase
        .from("plans")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", command.planId);

      if (planUpdateError) {
        await logAppError(this.supabase, {
          userId: command.userId,
          planId: command.planId,
          message: `Failed to update plan timestamp: ${planUpdateError.message}`,
          severity: "error",
          stackTrace: planUpdateError.stack,
          payload: { command, error: planUpdateError },
        });
        throw new Error(`Failed to update plan: ${planUpdateError.message}`);
      }
    } catch (error) {
      // Log unexpected errors
      await logAppError(this.supabase, {
        userId: command.userId,
        planId: command.planId,
        message: `Unexpected error in updatePlan: ${formatErrorMessage(error)}`,
        severity: "error",
        stackTrace: getStackTrace(error),
        payload: { command },
      });

      // Re-throw for endpoint to handle
      throw error;
    }
  }
}
