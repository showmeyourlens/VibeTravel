import type { APIContext } from "astro";

import { CitiesService } from "../../lib/services/cities.service";
import { logAppError } from "../../lib/utils/error-logger";
import type { ErrorResponseDTO } from "../../types";

export const prerender = false;

/**
 * GET /api/cities
 * Retrieves the list of available destination cities
 */
export async function GET(context: APIContext): Promise<Response> {
  try {
    // 1. Create cities service instance
    const citiesService = new CitiesService(context.locals.supabase);

    // 2. Fetch cities from the database
    let cities;
    try {
      cities = await citiesService.getCities();
    } catch (error) {
      // Log unexpected errors
      await logAppError(context.locals.supabase, {
        message: error instanceof Error ? error.message : "Unknown error fetching cities",
        severity: "error",
        stackTrace: error instanceof Error ? error.stack : undefined,
      });

      return new Response(JSON.stringify({ error: "Internal server error" } as ErrorResponseDTO), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Return successful response with caching headers
    return new Response(JSON.stringify(cities), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    // Catch-all for unexpected errors in the handler itself
    // eslint-disable-next-line no-console
    console.error("Unexpected error in /api/cities:", error);

    return new Response(JSON.stringify({ error: "Internal server error" } as ErrorResponseDTO), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
