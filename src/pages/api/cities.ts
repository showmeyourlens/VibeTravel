import type { APIRoute } from "astro";

import { CitiesService } from "./services/cities.service";
import { logAppError } from "../../lib/utils/error-logger";
import type { ErrorResponseDTO } from "../../types";
import { createSupabaseServerInstance } from "../../db/supabase.client";

export const prerender = false;

/**
 * GET /api/cities
 * Retrieves the list of available destination cities
 */
export const GET: APIRoute = async ({ request, cookies, locals }) => {
  const supabase = createSupabaseServerInstance({ headers: request.headers, cookies });
  try {
    // 1. User is already authenticated by middleware, available in `locals.user`
    const user = locals.user;

    // 2. Create cities service instance
    const citiesService = new CitiesService(supabase);

    // 3. Fetch cities from the database
    let cities;
    try {
      cities = await citiesService.getCities();
    } catch (error) {
      // Log unexpected errors
      await logAppError(supabase, {
        message: error instanceof Error ? error.message : "Unknown error fetching cities",
        severity: "error",
        stackTrace: error instanceof Error ? error.stack : undefined,
        userId: user?.id,
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
};
