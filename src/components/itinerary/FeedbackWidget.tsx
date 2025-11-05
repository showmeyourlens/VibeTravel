/**
 * Feedback Widget Component
 * Allows users to provide simple yes/no feedback about the generated plan
 * According to PRD specification (US-010)
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useFeedback } from "../hooks/useFeedback";

interface FeedbackWidgetProps {
  planId?: string;
  isDraft?: boolean;
  hasFeedback?: boolean;
  onFeedbackSubmitted?: () => void;
}

export default function FeedbackWidget({
  planId,
  isDraft = false,
  hasFeedback = false,
  onFeedbackSubmitted,
}: FeedbackWidgetProps) {
  const [planIdFromStorage, setPlanIdFromStorage] = useState<string | null>(null);
  const [isDraftFromStorage, setIsDraftFromStorage] = useState(false);
  const { isLoading, error, isSubmitted, submitFeedback } = useFeedback();

  // Extract plan ID and draft status from plan data in session storage on mount
  useEffect(() => {
    try {
      const storedPlan = sessionStorage.getItem("generatedPlan");
      if (storedPlan) {
        const parsedPlan = JSON.parse(storedPlan);
        const id = planId || parsedPlan.plan?.id;

        if (id && id !== "draft") {
          setPlanIdFromStorage(id);
          setIsDraftFromStorage(false);
        } else {
          setIsDraftFromStorage(true);
        }
      }
    } catch {
      // Ignore parsing errors - plan might not be saved yet
    }
  }, [planId, isDraft]);

  const activePlanId = planId || planIdFromStorage;
  const isCurrentlyDraft = isDraft || isDraftFromStorage;

  // Guard: Don't show widget if plan is draft, not saved, feedback already existed, or feedback already submitted
  if (!activePlanId || isCurrentlyDraft || hasFeedback || isSubmitted) {
    return null;
  }

  const handleFeedback = async (helpful: boolean) => {
    await submitFeedback(activePlanId, helpful);
    onFeedbackSubmitted?.();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40" role="region" aria-label="Plan feedback form">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80 border border-slate-200">
        <div className="space-y-4">
          {/* Feedback Question */}
          <div>
            <h3 className="text-slate-900 font-semibold text-sm leading-tight mb-4">Was this plan helpful?</h3>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-red-700 text-sm">
              <p className="font-medium">✕ {error}</p>
            </div>
          )}

          {/* Yes/No Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleFeedback(true)}
              disabled={isLoading}
              size="sm"
              variant="default"
              className="flex-1"
              aria-label="Helpful - Yes"
            >
              {isLoading ? "…" : "Yes"}
            </Button>
            <Button
              onClick={() => handleFeedback(false)}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="flex-1"
              aria-label="Helpful - No"
            >
              {isLoading ? "…" : "No"}
            </Button>
          </div>

          {/* Helper Text */}
          <p className="text-slate-500 text-xs text-center">Your feedback helps us improve</p>
        </div>
      </div>
    </div>
  );
}
