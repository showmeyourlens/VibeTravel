import type { APIRoute } from "astro";

import { generateRequestSchema } from "../../../lib/schemas/plan.schema";
import { logAppError } from "../../../lib/utils/error-logger";
import type { ErrorResponseDTO, GenerateDraftPlanCommand } from "../../../types";
import { ItineraryService } from "../services/itinerary.service";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

/**
 * POST /api/plans/generate
 * Generates a draft travel itinerary using AI
 */
export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const supabase = createSupabaseServerInstance({ headers: request.headers, cookies });
  try {
    // 1. Get authenticated user from middleware
    const user = locals.user;

    // 2. Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" } as ErrorResponseDTO), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Validate request against schema
    const validationResult = generateRequestSchema.safeParse(requestBody);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");

      return new Response(JSON.stringify({ error: errorMessage } as ErrorResponseDTO), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const validatedData = validationResult.data;

    // 4. Build command object
    const command: GenerateDraftPlanCommand = {
      userId: user.id,
      cityId: validatedData.city_id,
      durationDays: validatedData.duration_days,
      tripIntensity: validatedData.trip_intensity,
      userNotes: validatedData.user_notes,
    };

    // 5. Call itinerary service to generate plan
    const itineraryService = new ItineraryService(supabase);

    let result;
    try {
      result = await itineraryService.generateDraftPlan(command);
    } catch (error) {
      // Check for specific error types
      if (error instanceof Error) {
        if (error.message === "City not found") {
          return new Response(JSON.stringify({ error: "City not found" } as ErrorResponseDTO), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (error.message === "Unable to generate plan") {
          return new Response(JSON.stringify({ error: "Unable to generate plan" } as ErrorResponseDTO), {
            status: 422,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // Log unexpected errors
      await logAppError(supabase, {
        userId: user.id,
        message: error instanceof Error ? error.message : "Unknown error during plan generation",
        severity: "error",
        stackTrace: error instanceof Error ? error.stack : undefined,
        payload: { command },
      });

      return new Response(JSON.stringify({ error: "Internal server error" } as ErrorResponseDTO), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 6. Return successful response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Catch-all for unexpected errors in the handler itself
    // eslint-disable-next-line no-console
    console.error("Unexpected error in /api/plans/generate:", error);

    return new Response(JSON.stringify({ error: "Internal server error" } as ErrorResponseDTO), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
