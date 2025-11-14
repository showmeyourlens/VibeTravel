/**
 * Itinerary View Container Component
 * Main container that manages state and orchestrates the itinerary display
 */

import { useEffect, useState, useCallback } from "react";
import type { PlanWithActivitiesDto, SavePlanRequestDTO, SavePlanActivityDTO, UpdatePlanRequestDTO } from "@/types";
import { deletePlan, getFeedbackStatus, savePlan, updatePlan } from "@/lib/api-client";
import PlanMetadata from "./PlanMetadata";
import DisclaimerBanner from "./DisclaimerBanner";
import ActivityList from "./ActivityList";
import PlanActions from "./PlanActions";
import FeedbackWidget from "./FeedbackWidget";
import { useItineraryState } from "../hooks/useItineraryState";
import { navigate } from "astro:transitions/client";
import { Panel } from "../ui/Panel";

export function ItineraryView() {
  const [planData, setPlanData] = useState<PlanWithActivitiesDto | null>(null);
  const [isDraft, setIsDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userNotes, setUserNotes] = useState<string | undefined>();
  const [hasFeedback, setHasFeedback] = useState(false);

  /**
   * Fetch feedback status for the plan
   */
  const fetchPlanFeedbackStatus = useCallback(async (planId: string) => {
    try {
      const data = await getFeedbackStatus(planId);
      setHasFeedback(data.hasFeedback);
    } catch (err) {
      // Log error but don't fail the whole component
      // eslint-disable-next-line no-console
      console.error("Error fetching feedback status:", err);
    }
  }, []);

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

      // Fetch feedback status if plan is not a draft
      if (!isDraftPlan && parsedPlan.plan.id) {
        fetchPlanFeedbackStatus(parsedPlan.plan.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load plan data";
      setError(`Error loading plan: ${errorMessage}`);
    }
  }, [fetchPlanFeedbackStatus]);

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
    handleSave,
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
  const handleSavePlan = useCallback(async () => {
    const request = transformToSavePlanRequest();
    if (!request) {
      setError("Could not prepare plan for saving");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await savePlan(request);

      setSaveSuccess(true);
      handleSetEditing(false);
      setIsDraft(false);

      handleSave(response.plan.activities);
      sessionStorage.setItem("generatedPlan", JSON.stringify(response.plan));
      setPlanData(response.plan);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error while saving";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [transformToSavePlanRequest, handleSetEditing, handleSave]);

  /**
   * Handle deleting (archiving) the plan
   */
  const handleDeletePlan = useCallback(async () => {
    if (!planData?.plan?.id) {
      setError("Cannot delete plan: Plan ID is missing");
      return;
    }

    // Confirm deletion with user
    if (!confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await deletePlan(planData.plan.id);

      // Clear session storage and redirect to home
      sessionStorage.removeItem("generatedPlan");
      sessionStorage.removeItem("planMetadata");
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error while deleting";

      if (errorMessage.includes("not found")) {
        setError("Plan not found");
      } else if (errorMessage.includes("Access denied")) {
        setError("You don't have permission to delete this plan");
      } else if (errorMessage.includes("Unauthorized")) {
        setError("You must be logged in to delete plans");
      } else {
        setError(`Failed to delete plan: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [planData?.plan?.id]);

  /**
   * Handle updating the plan (reorder/reassign activities)
   */
  const handleUpdatePlan = useCallback(async () => {
    if (!planData?.plan?.id) {
      setError("Cannot update plan: Plan ID is missing");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Transform current activities to UpdatePlanRequestDTO format
      const updateRequest: UpdatePlanRequestDTO = {
        activities: currentActivities.map((activity) => ({
          id: activity.id,
          day_number: activity.day_number,
          position: activity.position,
        })),
      };

      await updatePlan(planData.plan.id, updateRequest);

      setSaveSuccess(true);
      handleSetEditing(false);
      handleSave(currentActivities);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error while updating";

      if (errorMessage.includes("not found")) {
        setError("Plan not found");
      } else if (errorMessage.includes("Access denied")) {
        setError("You don't have permission to update this plan");
      } else if (errorMessage.includes("Invalid")) {
        setError(`Invalid plan data: ${errorMessage}`);
      } else {
        setError(`Failed to update plan: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [planData?.plan?.id, currentActivities, handleSetEditing, handleSave]);

  // Render loading state
  if (!planData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md">
          {error ? (
            <>
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Unable to Load Plan</h2>
              <p className="text-slate-600 mb-6">{error}</p>
              <a href="/plans/new" className="text-primary hover:text-blue-800 underline">
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
    <div className="min-h-screen py-12 px-4" data-testid="itinerary-view">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Panel className="mb-8 text-left">
          <a href="/dashboard" className="text-primary hover:text-secondary text-sm mb-4 inline-block">
            ← Back to Dashboard
          </a>
          <h1 className="text-4xl font-bold">Your Trip Itinerary</h1>
        </Panel>

        {/* Success Message */}
        {saveSuccess && (
          <div
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-green-800"
            data-testid="plan-saved-success"
          >
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
          onSave={isDraft ? handleSavePlan : handleUpdatePlan}
          onCancel={handleCancel}
          onDelete={handleDeletePlan}
        />

        {/* Activities List */}
        <Panel className="mb-8 text-left">
          <h2 className="text-2xl font-bold mb-6">Activities</h2>
          <ActivityList
            days={days}
            isEditing={isEditing || isDraft}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onDelete={handleDelete}
          />
        </Panel>

        {/* Feedback Widget */}
        <FeedbackWidget hasFeedback={hasFeedback} />
      </div>
    </div>
  );
}
