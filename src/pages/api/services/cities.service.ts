import type { SupabaseClient } from "../../../db/supabase.client";
import type { CityDto } from "../../../types";
import { logAppError, formatErrorMessage, getStackTrace } from "../../../lib/utils/error-logger";

/**
 * Service for managing cities
 */
export class CitiesService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Retrieves all available destination cities
   * @returns Array of city DTOs
   * @throws Error if cities cannot be retrieved
   */
  async getCities(): Promise<CityDto[]> {
    try {
      const { data, error } = await this.supabase.from("cities").select("id, name").order("name", { ascending: true });

      if (error) {
        await logAppError(this.supabase, {
          message: `Failed to fetch cities: ${error.message}`,
          severity: "error",
          stackTrace: error.stack,
          payload: { error },
        });
        throw new Error(`Failed to retrieve cities: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      // Transform database rows to DTOs
      return data.map((row) => ({
        id: row.id,
        name: row.name,
      }));
    } catch (error) {
      // Log unexpected errors
      await logAppError(this.supabase, {
        message: `Unexpected error in getCities: ${formatErrorMessage(error)}`,
        severity: "error",
        stackTrace: getStackTrace(error),
      });

      // Re-throw for endpoint to handle
      throw error;
    }
  }
}
