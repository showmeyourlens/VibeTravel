import { logAppError, formatErrorMessage, getStackTrace } from "@/lib/utils/error-logger";
import type { ErrorResponseDTO } from "@/types";
import type { APIContext, APIRoute } from "astro";
import { PlanService } from "../services/plan.service";

/**
 * GET /api/plans/{planId}
 * Retrieves a single plan with activities by ID
 */
export async function GET(context: APIContext): Promise<Response> {
    try {
    // Step 1: Extract plan ID from URL parameters
      const planId = context.params.planId;
  
      // Step 1: Validate plan ID
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
  
    //   const userId = session.user.id;
    const userId = "e0000000-0000-0000-0000-00000000000e";
  
      // Step 3: Call the service to fetch plan with activities
      const planService = new PlanService(context.locals.supabase);
      const planWithActivities = await planService.getPlanWithActivitiesById(planId, userId);
  
      // Step 4: Return the response
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
      const supabase = context.locals.supabase;
      const session = (await supabase.auth.getSession()).data.session;
      const userId = session?.user?.id || "unknown";
  
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