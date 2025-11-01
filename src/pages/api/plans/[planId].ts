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
