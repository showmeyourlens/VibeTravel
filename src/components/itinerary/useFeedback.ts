import { useState, useCallback } from "react";
import type { SubmitFeedbackRequestDTO, SubmitFeedbackResponseDTO } from "@/types";

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

      const response = await fetch(`/api/plans/${planId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };

        // Handle specific error cases
        if (response.status === 401) {
          setError("You must be logged in to submit feedback");
          return;
        }

        if (response.status === 403) {
          setError("Feedback already submitted for this plan");
          return;
        }

        if (response.status === 404) {
          setError("Plan not found");
          return;
        }

        if (response.status === 400) {
          setError(errorData.error || "Invalid feedback data");
          return;
        }

        setError(errorData.error || "Failed to submit feedback");
        return;
      }

      // Success case
      const feedbackData = (await response.json()) as SubmitFeedbackResponseDTO;
      setIsSubmitted(true);

      // Log feedback for analytics (optional)
      console.log("Feedback submitted successfully:", feedbackData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error while submitting feedback";
      setError(errorMessage);
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
