import { logAppError, formatErrorMessage, getStackTrace } from "@/lib/utils/error-logger";
import type { ErrorResponseDTO } from "@/types";
import type { APIRoute } from "astro";
import { PlanService } from "../services/plan.service";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { updatePlanRequestSchema } from "@/lib/schemas/plan.schema";

/**
 * GET /api/plans/{planId}
 * Retrieves a single plan with activities by ID
 */
export const GET: APIRoute = async ({ params, request, cookies, locals }) => {
  const supabase = createSupabaseServerInstance({ headers: request.headers, cookies });
  try {
    // Step 1: Get authenticated user from middleware
    const user = locals.user;

    // Step 2: Extract plan ID from URL parameters
    const planId = params.planId;

    // Step 3: Validate plan ID
    if (!planId || typeof planId !== "string") {
      return new Response(
        JSON.stringify({
          error: "Invalid plan ID",
        } as ErrorResponseDTO),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 4: Call the service to fetch plan with activities
    const planService = new PlanService(supabase);
    const planWithActivities = await planService.getPlanWithActivitiesById(planId, user.id);

    // Step 5: Return the response
    return new Response(JSON.stringify(planWithActivities), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === "PLAN_NOT_FOUND") {
        return new Response(
          JSON.stringify({
            error: "Plan not found",
          } as ErrorResponseDTO),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (error.message === "PLAN_FORBIDDEN") {
        return new Response(
          JSON.stringify({
            error: "Access denied",
          } as ErrorResponseDTO),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Log unexpected error
    const user = locals.user;
    const userId = user?.id || "unknown";

    await logAppError(supabase, {
      userId,
      message: `Unexpected error in GET /api/plans/:id: ${formatErrorMessage(error)}`,
      severity: "error",
      stackTrace: getStackTrace(error),
      payload: { error },
    });

    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred.",
      } as ErrorResponseDTO),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * DELETE /api/plans/{planId}
 * Soft-archives a plan (sets is_archived = true)
 *
 * @requires Authentication - JWT Bearer token
 * @returns 204 - No Content (plan archived successfully)
 * @returns 401 - Unauthorized
 * @returns 403 - Forbidden
 * @returns 404 - Plan not found
 * @returns 500 - Server error
 */
export const DELETE: APIRoute = async ({ params, request, cookies, locals }) => {
  const supabase = createSupabaseServerInstance({ headers: request.headers, cookies });
  try {
    // Step 1: Get authenticated user from middleware
    const user = locals.user;

    // Step 2: Extract plan ID from URL parameters
    const planId = params.planId;

    // Step 3: Validate plan ID
    if (!planId || typeof planId !== "string") {
      return new Response(
        JSON.stringify({
          error: "Invalid plan ID",
        } as ErrorResponseDTO),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 4: Verify plan exists and belongs to user before archiving
    const planService = new PlanService(supabase);
    try {
      await planService.getPlanWithActivitiesById(planId, user.id);
    } catch (error) {
      // Plan not found or access denied
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          return new Response(
            JSON.stringify({
              error: "Plan not found",
            } as ErrorResponseDTO),
            {
              status: 404,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        if (error.message.includes("Access denied")) {
          return new Response(
            JSON.stringify({
              error: "Access denied",
            } as ErrorResponseDTO),
            {
              status: 403,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }
      throw error;
    }

    // Step 5: Archive the plan
    await planService.archivePlan(planId);

    // Step 6: Return 204 No Content response
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    // Log unexpected error
    const userId = locals.user?.id || "unknown";

    await logAppError(supabase, {
      userId,
      planId: params.planId,
      message: `Unexpected error in DELETE /api/plans/:id: ${formatErrorMessage(error)}`,
      severity: "error",
      stackTrace: getStackTrace(error),
      payload: { error },
    });

    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred.",
      } as ErrorResponseDTO),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * PATCH /api/plans/{planId}
 * Updates plan activities (reorder or reassign to different days)
 *
 * @requires Authentication - JWT Bearer token
 * @param planId (UUID) - The ID of the plan to update
 * @body {
 *   "activities": [
 *     { "id": "uuid", "day_number": 1, "position": 1 },
 *     { "id": "uuid", "day_number": 1, "position": 2 }
 *   ]
 * }
 * @returns 200 - Plan updated successfully with message
 * @returns 400 - Invalid planId format or request body validation failed
 * @returns 401 - Unauthorized (no valid JWT)
 * @returns 404 - Plan not found or doesn't belong to user
 * @returns 500 - Server error
 */
export const PATCH: APIRoute = async ({ params, request, cookies, locals }) => {
  const supabase = createSupabaseServerInstance({ headers: request.headers, cookies });

  try {
    // Step 1: Get authenticated user from middleware
    const user = locals.user;

    // Step 2: Extract and validate plan ID from URL parameters
    const planId = params.planId;

    if (!planId || typeof planId !== "string") {
      return new Response(
        JSON.stringify({
          error: "Invalid plan ID format.",
        } as ErrorResponseDTO),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 3: Parse request body
    const requestBody = await request.json();

    // Step 4: Validate request body using Zod schema
    const validationResult = updatePlanRequestSchema.safeParse(requestBody);

    if (!validationResult.success) {
      await logAppError(supabase, {
        userId: user.id,
        planId,
        message: "Invalid request body for PATCH /api/plans/{planId}",
        severity: "warning",
        payload: { requestBody, errors: validationResult.error.errors },
      });

      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: validationResult.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", "),
        } as ErrorResponseDTO),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 6: Transform DTO to UpdatePlanCommand
    const updateCommand = {
      userId: user.id,
      planId,
      activities: validationResult.data.activities?.map((activity) => ({
        id: activity.id,
        dayNumber: activity.day_number,
        position: activity.position,
      })),
    };

    // Step 7: Call the service to update the plan
    const planService = new PlanService(supabase);
    await planService.updatePlan(updateCommand);

    // Step 8: Return success response
    return new Response(
      JSON.stringify({
        message: "Plan updated successfully.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error) {
      // Activity not found or authorization failure
      if (error.message.includes("not found") || error.message.includes("access denied")) {
        return new Response(
          JSON.stringify({
            error: "Plan or activity not found.",
          } as ErrorResponseDTO),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Duplicate position or validation error
      if (error.message.includes("Duplicate") || error.message.includes("No updates provided")) {
        return new Response(
          JSON.stringify({
            error: error.message,
          } as ErrorResponseDTO),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Log unexpected error
    const userId = locals.user?.id || "unknown";

    await logAppError(supabase, {
      userId,
      planId: params.planId,
      message: `Unexpected error in PATCH /api/plans/:id: ${formatErrorMessage(error)}`,
      severity: "error",
      stackTrace: getStackTrace(error),
      payload: { error },
    });

    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred.",
      } as ErrorResponseDTO),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
