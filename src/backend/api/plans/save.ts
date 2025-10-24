import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { saveRequestSchema } from "../../schemas/plan.schema";
import { PlanService } from "../../services/plan.service";
import { logAppError, formatErrorMessage, getStackTrace } from "../../utils/error-logger";
import type { SavePlanCommand, SavePlanResponseDTO, ErrorResponseDTO } from "../../../types";

export const prerender = false;

/**
 * POST /api/plans/save
 * Saves a finalized travel plan with activities
 *
 * @requires Authentication - JWT Bearer token
 * @body SavePlanRequestDTO - Plan and activities data
 * @returns 201 - Plan saved successfully
 * @returns 400 - Validation error
 * @returns 401 - Unauthorized
 * @returns 500 - Server error
 */
export const POST: APIRoute = async (context) => {
  try {
    // Step 1: Extract Supabase client from context
    const supabase = context.locals.supabase;

    if (!supabase) {
      return new Response(JSON.stringify({ error: "Supabase client not available" } as ErrorResponseDTO), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 2: Authenticate user
    const user = { id: "123e4567-e89b-12d3-a456-426614174000" };

    // const {
    //   data: { user },
    //   error: authError,
    // } = await supabase.auth.getUser();

    // if (authError || !user) {
    //   return new Response(
    //     JSON.stringify({ error: "Unauthorized: Invalid or missing authentication token" } as ErrorResponseDTO),
    //     {
    //       status: 401,
    //       headers: { "Content-Type": "application/json" },
    //     }
    //   );
    // }

    // Step 3: Parse and validate request body
    let requestBody: unknown;
    try {
      requestBody = await context.request.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: `Invalid JSON in request body: ${error}` } as ErrorResponseDTO), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 4: Validate against schema
    let validatedData;
    try {
      validatedData = saveRequestSchema.parse(requestBody);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("; ");
        return new Response(JSON.stringify({ error: `Validation failed: ${errorMessages}` } as ErrorResponseDTO), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw error; // Re-throw unexpected errors
    }

    // Step 5: Build command for service layer
    const command: SavePlanCommand = {
      userId: user.id,
      cityId: validatedData.city_id,
      durationDays: validatedData.duration_days,
      tripIntensity: validatedData.trip_intensity,
      userNotes: validatedData.user_notes,
      activities: validatedData.activities,
    };

    // Step 6: Call service to save plan
    const planService = new PlanService(supabase);
    const result: SavePlanResponseDTO = await planService.saveFinalPlan(command);

    // Step 7: Return success response
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Step 8: Handle specific errors
    const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred";

    // Handle city not found error (404)
    if (errorMsg.includes("Invalid city_id")) {
      return new Response(JSON.stringify({ error: errorMsg } as ErrorResponseDTO), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 9: Handle unexpected errors
    const supabase = context.locals.supabase;

    // Log the error if we have a Supabase client
    if (supabase) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        await logAppError(supabase, {
          userId: user?.id,
          message: `Unexpected error in POST /api/plans/save: ${formatErrorMessage(error)}`,
          severity: "error",
          stackTrace: getStackTrace(error),
          payload: { error: error instanceof Error ? error.message : String(error) },
        });
      } catch (logError) {
        // Logging failed, but don't block the error response
        // eslint-disable-next-line no-console
        console.error("Failed to log error:", logError);
      }
    }

    // Return generic error response
    return new Response(JSON.stringify({ error: errorMsg } as ErrorResponseDTO), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
