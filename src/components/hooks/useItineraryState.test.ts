import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useItineraryState } from "./useItineraryState";
import type { PlanActivityDTO } from "@/types";

/**
 * Unit tests for useItineraryState hook
 * Tests cover state management, editing, dirty checking, and activity manipulation
 */

// ==========================================
// Test Data Fixtures
// ==========================================

function createActivity(overrides?: Partial<PlanActivityDTO>): PlanActivityDTO {
  const defaults: PlanActivityDTO = {
    id: `activity-${Math.random()}`,
    day_number: 1,
    position: 1,
    name: "Test Activity",
    latitude: 0,
    longitude: 0,
    google_maps_url: "https://maps.google.com",
  };
  return { ...defaults, ...overrides };
}

// ==========================================
// Initial State & Data Structure
// ==========================================

describe("useItineraryState - Initial State & Data Structure", () => {
  it("should initialize correctly with provided activities", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
    ];

    // Act
    const { result } = renderHook(() => useItineraryState(activities));

    // Assert
    expect(result.current.currentActivities).toEqual(activities);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });

  it("should group activities by day, sorting them by day_number and then by position", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
      createActivity({ id: "a3", day_number: 2, position: 1 }),
      createActivity({ id: "a4", day_number: 2, position: 2 }),
    ];

    // Act
    const { result } = renderHook(() => useItineraryState(activities));

    // Assert
    expect(result.current.days).toHaveLength(2);
    expect(result.current.days[0].dayNumber).toBe(1);
    expect(result.current.days[0].activities).toHaveLength(2);
    expect(result.current.days[1].dayNumber).toBe(2);
    expect(result.current.days[1].activities).toHaveLength(2);
  });

  it("should handle an empty initialActivities array without errors", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [];

    // Act
    const { result } = renderHook(() => useItineraryState(activities));

    // Assert
    expect(result.current.currentActivities).toEqual([]);
    expect(result.current.days).toEqual([]);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });

  it("should correctly sort and group activities that are not pre-sorted in initialActivities", () => {
    // Arrange - Intentionally unsorted
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 2, position: 2 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
      createActivity({ id: "a3", day_number: 2, position: 1 }),
      createActivity({ id: "a4", day_number: 1, position: 1 }),
    ];

    // Act
    const { result } = renderHook(() => useItineraryState(activities));

    // Assert
    expect(result.current.days).toHaveLength(2);

    // Day 1 should have activities sorted by position
    expect(result.current.days[0].dayNumber).toBe(1);
    expect(result.current.days[0].activities[0].id).toBe("a4");
    expect(result.current.days[0].activities[1].id).toBe("a2");

    // Day 2 should have activities sorted by position
    expect(result.current.days[1].dayNumber).toBe(2);
    expect(result.current.days[1].activities[0].id).toBe("a3");
    expect(result.current.days[1].activities[1].id).toBe("a1");
  });
});

// ==========================================
// Editing State & Dirty Checking
// ==========================================

describe("useItineraryState - Editing State & Dirty Checking", () => {
  it("should toggle isEditing state correctly", () => {
    // Arrange
    const activities = [createActivity({ id: "a1", day_number: 1, position: 1 })];
    const { result } = renderHook(() => useItineraryState(activities));

    // Act
    act(() => {
      result.current.handleSetEditing(true);
    });

    // Assert
    expect(result.current.isEditing).toBe(true);

    // Act - toggle back
    act(() => {
      result.current.handleSetEditing(false);
    });

    // Assert
    expect(result.current.isEditing).toBe(false);
  });

  it("should set isDirty flag to true after an activity is deleted", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));
    expect(result.current.isDirty).toBe(false);

    // Act
    act(() => {
      result.current.handleDelete("a1");
    });

    // Assert
    expect(result.current.isDirty).toBe(true);
  });

  it("should set isDirty flag to true after an activity is moved up", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));
    expect(result.current.isDirty).toBe(false);

    // Act
    act(() => {
      result.current.handleMoveDown("a1");
    });

    // Assert
    expect(result.current.isDirty).toBe(true);
  });

  it("should set isDirty flag to true after an activity is moved down", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));
    expect(result.current.isDirty).toBe(false);

    // Act
    act(() => {
      result.current.handleMoveUp("a2");
    });

    // Assert
    expect(result.current.isDirty).toBe(true);
  });

  it("should become false if an activity is moved and then moved back to its original spot", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));

    // Act - move activity
    act(() => {
      result.current.handleMoveDown("a1");
    });
    expect(result.current.isDirty).toBe(true);

    // Act - move it back
    act(() => {
      result.current.handleMoveUp("a1");
    });

    // Assert
    expect(result.current.isDirty).toBe(false);
  });

  it("should reset isDirty to false after handleCancel is called", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));

    // Act - make a change
    act(() => {
      result.current.handleDelete("a1");
    });
    expect(result.current.isDirty).toBe(true);

    // Act - cancel
    act(() => {
      result.current.handleCancel();
    });

    // Assert
    expect(result.current.isDirty).toBe(false);
  });
});

// ==========================================
// Activity Manipulation - Delete
// ==========================================

describe("useItineraryState - Activity Manipulation (Delete)", () => {
  it("should remove an activity and correctly recalculate positions for remaining activities within that day", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
      createActivity({ id: "a3", day_number: 1, position: 3 }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));

    // Act
    act(() => {
      result.current.handleDelete("a2");
    });

    // Assert
    expect(result.current.currentActivities).toHaveLength(2);
    expect(result.current.currentActivities.find((a) => a.id === "a2")).toBeUndefined();

    // Check positions are recalculated
    const remaining = result.current.currentActivities.sort((a, b) => a.position - b.position);
    expect(remaining[0].position).toBe(1);
    expect(remaining[1].position).toBe(2);
  });

  it("should not change the state if a non-existent activity ID is passed", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));

    // Act
    act(() => {
      result.current.handleDelete("non-existent");
    });

    // Assert
    expect(result.current.currentActivities).toHaveLength(2);
    expect(result.current.isDirty).toBe(false);
  });
});

// ==========================================
// Activity Manipulation - Move Up
// ==========================================

describe("useItineraryState - Activity Manipulation (Move Up)", () => {
  it("should swap the activity with the one before it in the same day", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
      createActivity({ id: "a3", day_number: 1, position: 3 }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));

    // Act
    act(() => {
      result.current.handleMoveUp("a2");
    });

    // Assert
    const sorted = result.current.currentActivities.sort((a, b) => a.position - b.position);
    expect(sorted[0].id).toBe("a2");
    expect(sorted[1].id).toBe("a1");
    expect(sorted[2].id).toBe("a3");
  });
});

// ==========================================
// Activity Manipulation - Move Down
// ==========================================

describe("useItineraryState - Activity Manipulation (Move Down)", () => {
  it("should swap the activity with the one after it in the same day", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
      createActivity({ id: "a3", day_number: 1, position: 3 }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));

    // Act
    act(() => {
      result.current.handleMoveDown("a2");
    });

    // Assert
    const sorted = result.current.currentActivities.sort((a, b) => a.position - b.position);
    expect(sorted[0].id).toBe("a1");
    expect(sorted[1].id).toBe("a3");
    expect(sorted[2].id).toBe("a2");
  });

  it("should do nothing if the activity is already the last one of the day", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));

    // Act
    act(() => {
      result.current.handleMoveDown("a2");
    });

    // Assert
    expect(result.current.currentActivities[1].id).toBe("a2");
    expect(result.current.currentActivities[1].position).toBe(2);
    expect(result.current.isDirty).toBe(false);
  });
});

// ==========================================
// State Reversion
// ==========================================

describe("useItineraryState - State Reversion", () => {
  it("should revert currentActivities to original state after delete manipulation", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));

    // Act - delete
    act(() => {
      result.current.handleDelete("a1");
    });
    expect(result.current.currentActivities).toHaveLength(1);

    // Act - cancel
    act(() => {
      result.current.handleCancel();
    });

    // Assert
    expect(result.current.currentActivities).toHaveLength(2);
    expect(result.current.currentActivities[0].id).toBe("a1");
    expect(result.current.currentActivities[1].id).toBe("a2");
  });

  it("should revert currentActivities to original state after move manipulations", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
      createActivity({ id: "a3", day_number: 1, position: 3 }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));

    // Act - move
    act(() => {
      result.current.handleMoveDown("a1");
      result.current.handleMoveDown("a1");
    });

    const sorted = result.current.currentActivities.sort((a, b) => a.position - b.position);
    expect(sorted[2].id).toBe("a1");

    // Act - cancel
    act(() => {
      result.current.handleCancel();
    });

    // Assert
    const originalSorted = result.current.currentActivities.sort((a, b) => a.position - b.position);
    expect(originalSorted[0].id).toBe("a1");
    expect(originalSorted[1].id).toBe("a2");
    expect(originalSorted[2].id).toBe("a3");
  });

  it("should set isEditing to false when handleCancel is called", () => {
    // Arrange
    const activities = [createActivity({ id: "a1", day_number: 1, position: 1 })];
    const { result } = renderHook(() => useItineraryState(activities));

    // Act
    act(() => {
      result.current.handleSetEditing(true);
    });
    expect(result.current.isEditing).toBe(true);

    // Act - cancel
    act(() => {
      result.current.handleCancel();
    });

    // Assert
    expect(result.current.isEditing).toBe(false);
  });
});

// ==========================================
// Prop Updates
// ==========================================

describe("useItineraryState - Prop Updates", () => {
  it("should update currentActivities if the initialActivities prop changes, reflecting new data from parent component", () => {
    // Arrange - First set of activities
    const initialActivities: PlanActivityDTO[] = [createActivity({ id: "a1", day_number: 1, position: 1 })];

    const { result, rerender } = renderHook(({ activities }) => useItineraryState(activities), {
      initialProps: { activities: initialActivities },
    });

    expect(result.current.currentActivities).toHaveLength(1);
    expect(result.current.currentActivities[0].id).toBe("a1");

    // Act - update prop with new activities
    const newActivities: PlanActivityDTO[] = [
      createActivity({ id: "b1", day_number: 1, position: 1 }),
      createActivity({ id: "b2", day_number: 1, position: 2 }),
    ];

    rerender({ activities: newActivities });

    // Assert
    expect(result.current.currentActivities).toHaveLength(2);
    expect(result.current.currentActivities[0].id).toBe("b1");
    expect(result.current.currentActivities[1].id).toBe("b2");
  });
});

// ==========================================
// Complex Scenarios
// ==========================================

describe("useItineraryState - Complex Scenarios", () => {
  it("should handle multiple consecutive operations correctly", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
      createActivity({ id: "a3", day_number: 1, position: 3 }),
      createActivity({ id: "a4", day_number: 1, position: 4 }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));

    // Act - multiple operations
    act(() => {
      result.current.handleMoveDown("a1"); // a2, a1, a3, a4
      result.current.handleMoveDown("a1"); // a2, a3, a1, a4
      result.current.handleDelete("a3"); // a2, a1, a4 (positions recalc)
      result.current.handleMoveUp("a4"); // a2, a4, a1
    });

    // Assert
    const sorted = result.current.currentActivities.sort((a, b) => a.position - b.position);
    expect(sorted).toHaveLength(3);
    expect(result.current.isDirty).toBe(true);
  });

  it("should handle activities across multiple days", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
      createActivity({ id: "a3", day_number: 2, position: 1 }),
      createActivity({ id: "a4", day_number: 2, position: 2 }),
      createActivity({ id: "a5", day_number: 3, position: 1 }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));

    // Act - delete from day 2
    act(() => {
      result.current.handleDelete("a3");
    });

    // Assert
    expect(result.current.days).toHaveLength(3);
    expect(result.current.days[1].activities).toHaveLength(1);
    expect(result.current.days[1].activities[0].id).toBe("a4");
    expect(result.current.days[1].activities[0].position).toBe(1); // position recalculated
  });

  it("should maintain originalActivities reference for comparison", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));

    // Act - make changes
    act(() => {
      result.current.handleMoveDown("a1");
    });

    // Assert - originalActivities should remain unchanged
    expect(result.current.originalActivities).toEqual(activities);
    expect(result.current.currentActivities).not.toEqual(result.current.originalActivities);
  });
});

// ==========================================
// Edge Cases
// ==========================================

describe("useItineraryState - Edge Cases", () => {
  it("should handle large number of days", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [];
    for (let day = 1; day <= 30; day++) {
      activities.push(createActivity({ id: `a-${day}`, day_number: day, position: 1 }));
    }
    const { result } = renderHook(() => useItineraryState(activities));

    // Assert
    expect(result.current.days).toHaveLength(30);
  });

  it("should handle activities with special characters in names", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1, name: "Café & Bar" }),
      createActivity({ id: "a2", day_number: 1, position: 2, name: "日本料理" }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));

    // Act
    act(() => {
      result.current.handleMoveDown("a1");
    });

    // Assert
    expect(result.current.currentActivities).toHaveLength(2);
    expect(result.current.isDirty).toBe(true);
  });

  it("should preserve activity data other than position during move operations", () => {
    // Arrange
    const activities: PlanActivityDTO[] = [
      createActivity({
        id: "a1",
        day_number: 1,
        position: 1,
        name: "Eiffel Tower",
        latitude: 48.8584,
        longitude: 2.2945,
        google_maps_url: "https://maps.google.com/?q=Eiffel+Tower",
      }),
      createActivity({
        id: "a2",
        day_number: 1,
        position: 2,
        name: "Louvre",
        latitude: 48.861,
        longitude: 2.336,
        google_maps_url: "https://maps.google.com/?q=Louvre",
      }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));

    // Act
    act(() => {
      result.current.handleMoveDown("a1");
    });

    // Assert
    const movedActivity = result.current.currentActivities.find((a) => a.id === "a1");
    expect(movedActivity?.name).toBe("Eiffel Tower");
    expect(movedActivity?.latitude).toBe(48.8584);
    expect(movedActivity?.longitude).toBe(2.2945);
    expect(movedActivity?.google_maps_url).toBe("https://maps.google.com/?q=Eiffel+Tower");
  });
});

// ==========================================
// Return Type & API Validation
// ==========================================

describe("useItineraryState - Return Type & API Validation", () => {
  it("should return object with correct properties", () => {
    // Arrange & Act
    const { result } = renderHook(() => useItineraryState([]));

    // Assert
    expect(result.current).toHaveProperty("currentActivities");
    expect(result.current).toHaveProperty("originalActivities");
    expect(result.current).toHaveProperty("days");
    expect(result.current).toHaveProperty("isEditing");
    expect(result.current).toHaveProperty("isDirty");
    expect(result.current).toHaveProperty("handleSetEditing");
    expect(result.current).toHaveProperty("handleMoveUp");
    expect(result.current).toHaveProperty("handleMoveDown");
    expect(result.current).toHaveProperty("handleDelete");
    expect(result.current).toHaveProperty("handleCancel");
  });

  it("should have handler functions as functions", () => {
    // Arrange & Act
    const { result } = renderHook(() => useItineraryState([]));

    // Assert
    expect(typeof result.current.handleSetEditing).toBe("function");
    expect(typeof result.current.handleMoveUp).toBe("function");
    expect(typeof result.current.handleMoveDown).toBe("function");
    expect(typeof result.current.handleDelete).toBe("function");
    expect(typeof result.current.handleCancel).toBe("function");
  });

  it("should have correct types for state properties", () => {
    // Arrange & Act
    const activities = [createActivity({ id: "a1", day_number: 1, position: 1 })];
    const { result } = renderHook(() => useItineraryState(activities));

    // Assert
    expect(Array.isArray(result.current.currentActivities)).toBe(true);
    expect(Array.isArray(result.current.originalActivities)).toBe(true);
    expect(Array.isArray(result.current.days)).toBe(true);
    expect(typeof result.current.isEditing).toBe("boolean");
    expect(typeof result.current.isDirty).toBe("boolean");
  });

  it("should have DayViewModel objects in days array with correct structure", () => {
    // Arrange & Act
    const activities: PlanActivityDTO[] = [
      createActivity({ id: "a1", day_number: 1, position: 1 }),
      createActivity({ id: "a2", day_number: 1, position: 2 }),
    ];
    const { result } = renderHook(() => useItineraryState(activities));

    // Assert
    expect(result.current.days[0]).toHaveProperty("dayNumber");
    expect(result.current.days[0]).toHaveProperty("activities");
    expect(typeof result.current.days[0].dayNumber).toBe("number");
    expect(Array.isArray(result.current.days[0].activities)).toBe(true);
  });
});
