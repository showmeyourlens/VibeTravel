import { createSupabaseServerInstance } from "@/db/supabase.client";
import { logAppError, formatErrorMessage, getStackTrace } from "@/lib/utils/error-logger";
import type { ErrorResponseDTO } from "@/types";
import type { APIRoute } from "astro";
import { PlanService } from "../../services/plan.service";

/**
 * POST /api/plans/{planId}/feedback
 * Submits feedback for a plan
 */
export const POST: APIRoute = async ({ params, request, cookies, locals }) => {
  const supabase = createSupabaseServerInstance({ headers: request.headers, cookies });

  try {
    // Step 1: Get authenticated user
    const user = locals.user;
    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" } as ErrorResponseDTO), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 2: Extract and validate plan ID
    const planId = params.planId;
    if (!planId || typeof planId !== "string") {
      return new Response(JSON.stringify({ error: "Invalid plan ID" } as ErrorResponseDTO), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 3: Parse request body
    const body = (await request.json()) as { helpful?: unknown };

    if (typeof body.helpful !== "boolean") {
      return new Response(JSON.stringify({ error: "helpful must be a boolean" } as ErrorResponseDTO), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 4: Check if plan exists and user has access
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id, user_id")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return new Response(JSON.stringify({ error: "Plan not found" } as ErrorResponseDTO), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (plan.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Access denied" } as ErrorResponseDTO), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 5: Check if feedback already exists
    const { data: existingFeedback, error: existingError } = await supabase
      .from("plan_feedback")
      .select("id")
      .eq("plan_id", planId)
      .eq("user_id", user.id)
      .single();

    if (!existingError && existingFeedback) {
      return new Response(JSON.stringify({ error: "Feedback already submitted for this plan" } as ErrorResponseDTO), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 6: Insert feedback
    const { data: feedbackData, error: feedbackError } = await supabase
      .from("plan_feedback")
      .insert({
        plan_id: planId,
        user_id: user.id,
        helpful: body.helpful,
      })
      .select("id, created_at")
      .single();

    if (feedbackError || !feedbackData) {
      await logAppError(supabase, {
        userId: user.id,
        planId,
        message: `Failed to insert feedback: ${feedbackError?.message || "Unknown error"}`,
        severity: "error",
        stackTrace: feedbackError?.stack,
        payload: { feedbackError, planId, helpful: body.helpful },
      });

      return new Response(JSON.stringify({ error: "Failed to submit feedback" } as ErrorResponseDTO), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 7: Return success response
    return new Response(
      JSON.stringify({
        id: feedbackData.id,
        created_at: feedbackData.created_at,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const user = locals.user;
    const userId = user?.id || "unknown";

    await logAppError(supabase, {
      userId,
      planId: params.planId,
      message: `Unexpected error in POST /api/plans/:id/feedback: ${formatErrorMessage(error)}`,
      severity: "error",
      stackTrace: getStackTrace(error),
      payload: { error },
    });

    return new Response(JSON.stringify({ error: "An unexpected error occurred" } as ErrorResponseDTO), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const GET: APIRoute = async ({ params, request, cookies, locals }) => {
  const supabase = createSupabaseServerInstance({ headers: request.headers, cookies });

  try {
    // Step 1: Get authenticated user
    const user = locals.user;
    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" } as ErrorResponseDTO), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 2: Extract and validate planId query parameter;
    const planId = params.planId;

    if (!planId || typeof planId !== "string") {
      return new Response(JSON.stringify({ error: "Invalid or missing planId" } as ErrorResponseDTO), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 3: Check feedback status
    const planService = new PlanService(supabase);
    const hasFeedback = await planService.hasFeedback(planId, user.id);

    // Step 4: Return feedback status
    return new Response(JSON.stringify({ hasFeedback }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const user = locals.user;
    const userId = user?.id || "unknown";

    await logAppError(supabase, {
      userId,
      message: `Unexpected error in GET /api/plans/feedback: ${formatErrorMessage(error)}`,
      severity: "error",
      stackTrace: getStackTrace(error),
      payload: { error },
    });

    return new Response(JSON.stringify({ error: "An unexpected error occurred" } as ErrorResponseDTO), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
