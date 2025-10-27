import { useState, useEffect, useCallback } from "react";
import { fetchCities } from "@/lib/api-client";
import type { CityDto, GenerateDraftPlanRequestDTO, PlanWithActivitiesDto } from "@/types";

export interface PlanWizardViewModel {
  cityId: string | null;
  durationDays: number | null;
  tripIntensity: "full day" | "half day" | null;
  userNotes: string;
}

interface UsePlanWizardReturn {
  currentStep: number;
  formData: PlanWizardViewModel;
  cities: CityDto[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  handlePrev: () => void;
  updateFormData: (updates: Partial<PlanWizardViewModel>, autoAdvance?: boolean) => void;
  generatePlan: () => Promise<void>;
}

const TOTAL_STEPS = 4;

export function usePlanWizard(): UsePlanWizardReturn {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PlanWizardViewModel>({
    cityId: null,
    durationDays: null,
    tripIntensity: null,
    userNotes: "",
  });
  const [cities, setCities] = useState<CityDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cities on mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsFetching(true);
        setError(null);
        const fetchedCities = await fetchCities();
        setCities(fetchedCities);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load cities";
        setError(`Unable to load cities: ${errorMessage}`);
      } finally {
        setIsFetching(false);
      }
    };

    loadCities();
  }, []);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const updateFormData = useCallback(
    (updates: Partial<PlanWizardViewModel>, autoAdvance = false) => {
      setFormData((prev) => ({ ...prev, ...updates }));

      // Auto-advance to next step if requested and not on final step
      if (autoAdvance && currentStep < TOTAL_STEPS) {
        // Use setTimeout to ensure state update completes before advancing
        setTimeout(() => {
          setCurrentStep((step) => step + 1);
        }, 0);
      }
    },
    [currentStep]
  );

  const generatePlan = useCallback(async () => {
    // Validate all required fields
    if (!formData.cityId || !formData.durationDays || !formData.tripIntensity) {
      setError("Please complete all required fields");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const request: GenerateDraftPlanRequestDTO = {
        city_id: formData.cityId,
        duration_days: formData.durationDays,
        trip_intensity: formData.tripIntensity,
        user_notes: formData.userNotes || undefined,
      };

      const response = await fetch("/api/plans/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error: string };
        const errorMessage = errorData.error || "Failed to generate plan";

        // Handle specific error scenarios
        if (response.status === 400) {
          setError(`Invalid input: ${errorMessage}`);
        } else if (response.status === 422) {
          setError("We couldn't generate a plan with these options. Please try adjusting them.");
        } else if (response.status === 500) {
          setError("An unexpected error occurred. Please try again later.");
        } else {
          setError(errorMessage);
        }
        setIsLoading(false);
        return;
      }

      const result = (await response.json()) as PlanWithActivitiesDto;

      // Store the generated plan in sessionStorage for the next page
      sessionStorage.setItem("generatedPlan", JSON.stringify(result));
      sessionStorage.setItem("planMetadata", JSON.stringify(formData));

      // Redirect to plan view
      window.location.href = `/plans/view`;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [formData]);

  return {
    currentStep,
    formData,
    cities,
    isLoading,
    isFetching,
    error,
    handlePrev,
    updateFormData,
    generatePlan,
  };
}
