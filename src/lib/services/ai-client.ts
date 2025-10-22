import type { PlanActivityDTO } from "../../types";

/**
 * Request payload for AI itinerary generation
 */
export interface AIItineraryRequest {
  cityId: string;
  cityName: string;
  durationDays: number;
  tripIntensity: "full day" | "half day";
  userNotes?: string;
}

/**
 * Response from AI itinerary generation
 */
export interface AIItineraryResponse {
  activities: PlanActivityDTO[];
  disclaimer: string;
}

/**
 * AI Client Service
 * Currently returns mock data for development
 * TODO: Integrate with actual AI service (OpenAI, Anthropic, etc.)
 */
export class AIClient {
  /**
   * Generates a travel itinerary using AI
   * @param request - The itinerary generation request
   * @returns Promise resolving to the generated itinerary
   * @throws Error if AI service fails
   */
  async generateItinerary(request: AIItineraryRequest): Promise<AIItineraryResponse> {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock data - in production, this would call an AI service
      const activitiesPerDay = request.tripIntensity === "full day" ? 6 : 3;
      const activities: PlanActivityDTO[] = [];

      for (let day = 1; day <= request.durationDays; day++) {
        for (let pos = 1; pos <= activitiesPerDay; pos++) {
          activities.push({
            day_number: day,
            position: pos,
            name: this.getMockActivityName(request.cityName, day, pos),
            latitude: this.getMockLatitude(),
            longitude: this.getMockLongitude(),
            google_maps_url: this.getMockGoogleMapsUrl(request.cityName, day, pos),
          });
        }
      }

      return {
        activities,
        disclaimer:
          "This itinerary is AI-generated and should be used as a starting point. Please verify opening hours, ticket prices, and current availability before your trip.",
      };
    } catch (error) {
      throw new Error(`AI service error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Generates a mock activity name
   */
  private getMockActivityName(cityName: string, day: number, position: number): string {
    const activities = [
      `Explore ${cityName} City Center`,
      `Visit ${cityName} Museum`,
      `Historic ${cityName} Walking Tour`,
      `Local Market Experience`,
      `Waterfront Promenade`,
      `Traditional ${cityName} Cuisine`,
      `Panoramic City Viewpoint`,
      `Cultural District Tour`,
      `Local Artisan Quarter`,
      `Sunset at ${cityName} Harbor`,
    ];

    const index = ((day - 1) * 10 + position - 1) % activities.length;
    return activities[index];
  }

  /**
   * Generates a mock latitude (European range)
   */
  private getMockLatitude(): number {
    return 40 + Math.random() * 20; // Roughly 40-60°N (European latitudes)
  }

  /**
   * Generates a mock longitude (European range)
   */
  private getMockLongitude(): number {
    return -10 + Math.random() * 40; // Roughly -10 to 30°E (European longitudes)
  }

  /**
   * Generates a mock Google Maps URL
   */
  private getMockGoogleMapsUrl(cityName: string, day: number, position: number): string {
    const lat = this.getMockLatitude();
    const lng = this.getMockLongitude();
    const placeName = this.getMockActivityName(cityName, day, position).replace(/\s+/g, "+");
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${placeName}`;
  }
}

/**
 * Singleton instance of the AI client
 */
export const aiClient = new AIClient();
