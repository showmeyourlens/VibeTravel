import type { SupabaseClient } from "../../../db/supabase.client";
import type { GenerateDraftPlanCommand, GenerateDraftPlanResponseDTO } from "../../../types";
import { aiClient } from "./ai-client";

/**
 * Itinerary Service
 * Orchestrates the generation of travel itineraries
 */
export class ItineraryService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Generates a draft travel plan using AI
   * @param command - The plan generation command
   * @returns Promise resolving to the generated plan
   * @throws Error if city not found or AI service fails
   */
  async generateDraftPlan(command: GenerateDraftPlanCommand): Promise<GenerateDraftPlanResponseDTO> {
    // 1. Verify city exists
    const { data: city, error: cityError } = await this.supabase
      .from("cities")
      .select("id, name")
      .eq("id", command.cityId)
      .single();

    if (cityError || !city) {
      throw new Error("City not found");
    }

    // 2. Generate itinerary using AI service
    let aiResponse;
    try {
      aiResponse = await aiClient.generateItinerary({
        cityId: command.cityId,
        cityName: city.name,
        durationDays: command.durationDays,
        tripIntensity: command.tripIntensity,
        userNotes: command.userNotes,
      });
    } catch (error) {
      // Log to LLM error logs
      await this.logLLMError(command.userId, error, {
        cityId: command.cityId,
        durationDays: command.durationDays,
        tripIntensity: command.tripIntensity,
        userNotes: command.userNotes,
      });

      throw new Error("Unable to generate plan");
    }

    return {
      plan: {
        duration_days: command.durationDays,
        trip_intensity: command.tripIntensity,
        activities: aiResponse.activities,
        disclaimer: aiResponse.disclaimer,
      },
    };
  }

  /**
   * Logs LLM errors to the database
   * @param userId - The user ID
   * @param error - The error that occurred
   * @param requestPayload - The request payload sent to the AI
   * @param responsePayload - Optional response payload from the AI
   */
  private async logLLMError(
    userId: string,
    error: unknown,
    requestPayload: Record<string, unknown>,
    responsePayload?: Record<string, unknown>
  ): Promise<void> {
    // Simulate async DB logging with a delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Mock: log error details to the server console
    // In production, replace with Supabase 'llm_error_logs' insert
    // and error handling.
    // Use error instanceof Error to provide a message and stack, otherwise stringified
    const errorInfo =
      error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };

    await this.supabase.from("llm_error_logs").insert({
      message: errorInfo.message,
      plan_id: null,
      request_payload: JSON.stringify(requestPayload), //todo: check if this works
      response_payload: JSON.stringify(responsePayload), //todo: check if this works
      user_id: userId,
    });
  }
}
