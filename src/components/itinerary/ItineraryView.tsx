/**
 * Itinerary View Container Component
 * Main container that manages state and orchestrates the itinerary display
 */

import { useEffect, useState, useCallback } from "react";
import type { PlanWithActivitiesDto, SavePlanRequestDTO, SavePlanActivityDTO } from "@/types";
import PlanMetadata from "./PlanMetadata";
import DisclaimerBanner from "./DisclaimerBanner";
import ActivityList from "./ActivityList";
import PlanActions from "./PlanActions";
import FeedbackWidget from "./FeedbackWidget";
import { useItineraryState } from "./useItineraryState";

export function ItineraryView() {
  const [planData, setPlanData] = useState<PlanWithActivitiesDto | null>(null);
  const [isDraft, setIsDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userNotes, setUserNotes] = useState<string | undefined>();

  // Load plan data from session storage on mount
  useEffect(() => {
    try {
      const storedPlan = sessionStorage.getItem("generatedPlan");
      if (!storedPlan) {
        setError("No plan data found. Please generate a plan first.");
        return;
      }

      const parsedPlan = JSON.parse(storedPlan) as PlanWithActivitiesDto;

      // Check if it's a newly generated draft
      const isDraftPlan = !parsedPlan.plan.id || parsedPlan.plan.id === "draft";
      setIsDraft(isDraftPlan);

      // Get user notes from session storage if available
      const storedMetadata = sessionStorage.getItem("planMetadata");
      if (storedMetadata) {
        try {
          const metadata = JSON.parse(storedMetadata);
          if (metadata.userNotes) {
            setUserNotes(metadata.userNotes);
          }
        } catch {
          // Ignore metadata parsing errors
        }
      }

      setPlanData(parsedPlan);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load plan data";
      setError(`Error loading plan: ${errorMessage}`);
    }
  }, []);

  // Initialize hook only after planData is loaded
  const shouldInitializeState = planData !== null;

  const {
    currentActivities,
    days,
    isEditing,
    isDirty,
    handleSetEditing,
    handleMoveUp,
    handleMoveDown,
    handleDelete,
    handleCancel,
  } = useItineraryState(shouldInitializeState ? planData.activities : []);

  /**
   * Transform current activities back to SavePlanActivityDTO format
   */
  const transformToSavePlanRequest = useCallback((): SavePlanRequestDTO | null => {
    if (!planData) return null;

    const activities: SavePlanActivityDTO[] = currentActivities.map((activity) => ({
      day_number: activity.day_number,
      position: activity.position,
      name: activity.name,
      latitude: activity.latitude,
      longitude: activity.longitude,
      notes: undefined,
      google_maps_url: activity.google_maps_url,
    }));

    return {
      city_id: planData.plan.city.id,
      duration_days: planData.plan.duration_days,
      trip_intensity: planData.plan.trip_intensity,
      user_notes: userNotes,
      activities,
    };
  }, [planData, currentActivities, userNotes]);

  /**
   * Handle saving the plan
   */
  const handleSave = useCallback(
    async (isDraft: boolean) => {
      const request = transformToSavePlanRequest();
      if (!request) {
        setError("Could not prepare plan for saving");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/plans/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };

          if (response.status === 401) {
            setError("You must be logged in to save plans");
            // TODO: Redirect to login
            return;
          }

          if (response.status === 400) {
            setError(`Invalid plan data: ${errorData.error || "Please check your plan and try again"}`);
            return;
          }

          if (response.status === 500) {
            setError("An unexpected error occurred while saving. Please try again.");
            return;
          }

          setError(errorData.error || "Failed to save plan");
          return;
        }

        setSaveSuccess(true);
        handleSetEditing(false);

        // Reset success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);

        // Clear session storage after successful save
        if (!isDraft) {
          sessionStorage.removeItem("generatedPlan");
          sessionStorage.removeItem("planMetadata");
          window.location.href = "/";
        } else {
          setIsDraft(false);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Network error while saving";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [transformToSavePlanRequest, handleSetEditing]
  );

  // Render loading state
  if (!planData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md">
          {error ? (
            <>
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Unable to Load Plan</h2>
              <p className="text-slate-600 mb-6">{error}</p>
              <a href="/plans/new" className="text-blue-600 hover:text-blue-800 underline">
                Create a new plan
              </a>
            </>
          ) : (
            <>
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Loading your plan...</h2>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
            ← Back to Dashboard
          </a>
          <h1 className="text-4xl font-bold text-slate-900">Your Trip Itinerary</h1>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-green-800">
            <p className="font-semibold">✓ Plan saved successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-800">
            <p className="font-semibold">✕ {error}</p>
          </div>
        )}

        {/* Plan Metadata */}
        <PlanMetadata plan={planData.plan} userNotes={userNotes} />

        {/* Disclaimer */}
        <DisclaimerBanner />

        {/* Plan Actions */}
        <PlanActions
          isEditing={isEditing}
          isDirty={isDirty}
          isDraft={isDraft}
          isLoading={isLoading}
          onEdit={() => handleSetEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
        />

        {/* Activities List */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Activities</h2>
          <ActivityList
            days={days}
            isEditing={isEditing}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onDelete={handleDelete}
          />
        </div>

        {/* Feedback Widget */}
        <FeedbackWidget />
      </div>
    </div>
  );
}
