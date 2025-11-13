import { useState, useCallback } from "react";
import { submitFeedbackApi } from "@/lib/api-client";
import type { SubmitFeedbackRequestDTO } from "@/types";

interface UseFeedbackState {
  isLoading: boolean;
  error: string | null;
  isSubmitted: boolean;
}

interface UseFeedbackReturn extends UseFeedbackState {
  submitFeedback: (planId: string, helpful: boolean) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for managing plan feedback submission
 * Handles submission, error states, and success tracking
 */
export function useFeedback(): UseFeedbackReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitFeedback = useCallback(async (planId: string, helpful: boolean) => {
    // Guard: Validate inputs
    if (!planId || typeof helpful !== "boolean") {
      setError("Invalid feedback data");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const payload: SubmitFeedbackRequestDTO = { helpful };

      const feedbackData = await submitFeedbackApi(planId, payload);
      setIsSubmitted(true);

      // Log feedback for analytics (optional)
      // eslint-disable-next-line no-console
      console.log("Feedback submitted successfully:", feedbackData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error while submitting feedback";
      setError(errorMessage);
      // eslint-disable-next-line no-console
      console.error("Feedback submission error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setIsSubmitted(false);
  }, []);

  return {
    isLoading,
    error,
    isSubmitted,
    submitFeedback,
    reset,
  };
}
