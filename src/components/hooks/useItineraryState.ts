/**
 * Custom hook for managing itinerary state
 * Handles activities, editing state, dirty checking, and activity manipulation
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import type { PlanActivityDTO } from "@/types";

interface DayViewModel {
  dayNumber: number;
  activities: PlanActivityDTO[];
}

interface UseItineraryStateReturn {
  currentActivities: PlanActivityDTO[];
  originalActivities: PlanActivityDTO[];
  days: DayViewModel[];
  isEditing: boolean;
  isDirty: boolean;
  handleSetEditing: (isEditing: boolean) => void;
  handleMoveUp: (activityId: string) => void;
  handleMoveDown: (activityId: string) => void;
  handleDelete: (activityId: string) => void;
  handleCancel: () => void;
  handleSave: (initialActivities: PlanActivityDTO[]) => void;
}

/**
 * Groups activities by day number
 */
function groupActivitiesByDay(activities: PlanActivityDTO[]): DayViewModel[] {
  const grouped = new Map<number, PlanActivityDTO[]>();

  // Group activities by day
  activities.forEach((activity) => {
    activity.id = activity.id == "" ? crypto.randomUUID() : activity.id;
    if (!grouped.has(activity.day_number)) {
      grouped.set(activity.day_number, []);
    }
    grouped.get(activity.day_number)?.push(activity);
  });

  // Sort activities within each day by position
  grouped.forEach((activities) => {
    activities.sort((a, b) => a.position - b.position);
  });

  // Convert to DayViewModel array sorted by day number
  return Array.from(grouped.entries())
    .sort(([dayA], [dayB]) => dayA - dayB)
    .map(([dayNumber, activities]) => ({
      dayNumber,
      activities,
    }));
}

/**
 * Recalculates positions for activities within a day
 */
function recalculatePositions(activities: PlanActivityDTO[]): PlanActivityDTO[] {
  const grouped = new Map<number, PlanActivityDTO[]>();

  // Group by day
  activities.forEach((activity) => {
    if (!grouped.has(activity.day_number)) {
      grouped.set(activity.day_number, []);
    }
    grouped.get(activity.day_number)?.push(activity);
  });

  // Recalculate positions within each day
  const result: PlanActivityDTO[] = [];
  grouped.forEach((dayActivities, dayNumber) => {
    dayActivities
      .sort((a, b) => a.position - b.position)
      .forEach((activity, index) => {
        result.push({
          ...activity,
          position: index + 1,
          day_number: dayNumber,
        });
      });
  });

  return result;
}

export function useItineraryState(initialActivities: PlanActivityDTO[]): UseItineraryStateReturn {
  const [currentActivities, setCurrentActivities] = useState<PlanActivityDTO[]>(initialActivities);
  const [originalActivities, setOriginalActivities] = useState<PlanActivityDTO[]>(initialActivities);
  const [isEditing, setIsEditing] = useState(initialActivities.some((activity) => activity.id == ""));

  // Update currentActivities when initialActivities changes
  useEffect(() => {
    setCurrentActivities(initialActivities);
    setOriginalActivities(initialActivities);
  }, [initialActivities]);

  // Check if activities have changed
  const isDirty = useMemo(() => {
    if (currentActivities.length !== originalActivities.length) {
      return true;
    }

    return !currentActivities.every((activity, index) => {
      const original = originalActivities[index];
      return (
        activity.id === original.id &&
        activity.day_number === original.day_number &&
        activity.position === original.position
      );
    });
  }, [currentActivities, originalActivities]);

  // Group activities by day for rendering
  const days = useMemo(() => groupActivitiesByDay(currentActivities), [currentActivities]);

  const handleSetEditing = useCallback((editing: boolean) => {
    setIsEditing(editing);
  }, []);

  /**
   * Move an activity up (to previous position in the same day)
   */
  const handleMoveUp = useCallback((activityId: string) => {
    setCurrentActivities((prev) => {
      const activity = prev.find((a) => a.id === activityId);
      if (!activity) return prev;

      // Find the activity before it in the same day
      const sameDay = prev.filter((a) => a.day_number === activity.day_number);
      const currentIndex = sameDay.find((a) => a.id === activityId)?.position ?? 0;

      if (currentIndex <= 0) return prev; // Already first

      // Swap positions with previous activity
      const previousActivity = sameDay.find((a) => a.position === currentIndex - 1);
      const updated = prev.map((a) => {
        if (a.id === activityId) {
          return { ...a, position: previousActivity?.position ?? 0 };
        }
        if (a.id === previousActivity?.id) {
          return { ...a, position: activity.position };
        }
        return a;
      });

      return updated;
    });
  }, []);

  /**
   * Move an activity down (to next position in the same day)
   */
  const handleMoveDown = useCallback((activityId: string) => {
    setCurrentActivities((prev) => {
      const activity = prev.find((a) => a.id === activityId);
      if (!activity) return prev;

      // Find the activity after it in the same day
      const sameDay = prev.filter((a) => a.day_number === activity.day_number);
      const currentIndex = sameDay.find((a) => a.id === activityId)?.position ?? 0;

      if (currentIndex >= sameDay.length) return prev; // Already last

      // Swap positions with next activity
      const nextActivity = sameDay.find((a) => a.position === currentIndex + 1);
      const updated = prev.map((a) => {
        if (a.id === activityId) {
          return { ...a, position: nextActivity?.position ?? 0 };
        }
        if (a.id === nextActivity?.id) {
          return { ...a, position: activity.position };
        }
        return a;
      });

      return updated;
    });
  }, []);

  /**
   * Delete an activity
   */
  const handleDelete = useCallback((activityId: string) => {
    setCurrentActivities((prev) => {
      const filtered = prev.filter((a) => a.id !== activityId);
      // Recalculate positions after deletion
      return recalculatePositions(filtered);
    });
  }, []);

  /**
   * Cancel editing and revert to original state
   */
  const handleCancel = useCallback(() => {
    setCurrentActivities(originalActivities);
    setIsEditing(false);
  }, [originalActivities]);

  const handleSave = useCallback((initialActivities: PlanActivityDTO[]) => {
    setOriginalActivities(initialActivities);
    setCurrentActivities(initialActivities);
  }, []);

  return {
    currentActivities,
    originalActivities,
    days,
    isEditing,
    isDirty,
    handleSetEditing,
    handleMoveUp,
    handleMoveDown,
    handleDelete,
    handleCancel,
    handleSave,
  };
}
