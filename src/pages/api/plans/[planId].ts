import { logAppError, formatErrorMessage, getStackTrace } from "@/lib/utils/error-logger";
import type { ErrorResponseDTO } from "@/types";
import type { APIRoute } from "astro";
import { PlanService } from "../services/plan.service";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

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
