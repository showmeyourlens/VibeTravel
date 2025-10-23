import type { APIRoute } from "astro";
import { listPlansQuerySchema } from "../../../lib/schemas/plan.schema";
import { PlanService } from "../../../lib/services/plan.service";
import type { ListPlansResponseDto, ErrorResponseDTO } from "../../../types";
import { logAppError, formatErrorMessage, getStackTrace } from "../../../lib/utils/error-logger";

/**
 * GET /api/plans
 * Retrieves a paginated list of plans for the authenticated user
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Step 1: Verify authentication
    const supabase = locals.supabase;
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Unauthorized" } as ErrorResponseDTO), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = session.user.id;

    // Step 2: Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = {
      page: url.searchParams.get("page") || undefined,
      page_size: url.searchParams.get("page_size") || undefined,
      sort: url.searchParams.get("sort") || undefined,
    };

    const validationResult = listPlansQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      // Log validation error
      await logAppError(supabase, {
        userId,
        message: "Invalid query parameters for GET /api/plans",
        severity: "warning",
        payload: { queryParams, errors: validationResult.error.errors },
      });

      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: validationResult.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", "),
        } as ErrorResponseDTO),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { page, page_size, sort } = validationResult.data;

    // Step 3: Call the service to fetch plans
    const planService = new PlanService(supabase);
    const { plans, total } = await planService.listUserPlans({
      page,
      pageSize: page_size,
      sort,
      userId,
    });

    // Step 4: Format and return the response
    const response: ListPlansResponseDto = {
      data: plans,
      pagination: {
        page,
        page_size,
        total,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log unexpected error
    const supabase = locals.supabase;
    const session = (await supabase.auth.getSession()).data.session;
    const userId = session?.user?.id || "unknown";

    await logAppError(supabase, {
      userId,
      message: `Unexpected error in GET /api/plans: ${formatErrorMessage(error)}`,
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
