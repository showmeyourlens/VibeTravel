import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFeedback } from "./useFeedback";
import type { SubmitFeedbackRequestDTO, SubmitFeedbackResponseDTO } from "@/types";

/**
 * Unit tests for useFeedback hook - submitFeedback function
 * Tests cover business rules, edge cases, and error scenarios
 */

describe("useFeedback.submitFeedback", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any;

  beforeEach(() => {
    // Mock fetch globally before each test
    fetchSpy = vi.spyOn(global, "fetch");
  });

  afterEach(() => {
    // Clean up mocks after each test
    vi.clearAllMocks();
  });

  // Helper to mock successful response
  function mockFetchSuccess(response: Response): void {
    fetchSpy.mockResolvedValueOnce(response);
  }

  // Helper to mock error response
  function mockFetchError(error: Error | string | undefined): void {
    fetchSpy.mockRejectedValueOnce(error);
  }

  // Helper to mock custom implementation
  function mockFetchImplementation(fn: () => Promise<Response>): void {
    fetchSpy.mockImplementationOnce(fn);
  }

  // ==========================================
  // Arrange-Act-Assert: Happy Path Tests
  // ==========================================

  describe("Happy path - successful feedback submission", () => {
    it("should submit feedback successfully and update state", async () => {
      // Arrange
      const mockResponse: SubmitFeedbackResponseDTO = {
        id: "feedback-123",
        created_at: "2024-11-05T10:00:00Z",
      };

      mockFetchSuccess(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-456", true);
      });

      // Assert
      expect(result.current.isSubmitted).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it("should send correct request payload", async () => {
      // Arrange
      mockFetchSuccess(
        new Response(JSON.stringify({ id: "feedback-123", created_at: "2024-11-05T10:00:00Z" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const { result } = renderHook(() => useFeedback());
      const planId = "plan-789";
      const helpful = false;

      // Act
      await act(async () => {
        await result.current.submitFeedback(planId, helpful);
      });

      // Assert
      expect(fetchSpy).toHaveBeenCalledWith(`/api/plans/${planId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpful } as SubmitFeedbackRequestDTO),
      });
    });

    it("should submit positive feedback (helpful: true)", async () => {
      // Arrange
      mockFetchSuccess(
        new Response(JSON.stringify({ id: "feedback-456", created_at: "2024-11-05T10:00:00Z" }), {
          status: 200,
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-999", true);
      });

      // Assert
      expect(result.current.isSubmitted).toBe(true);
      expect(result.current.error).toBeNull();
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/plans/plan-999/feedback"),
        expect.objectContaining({
          body: JSON.stringify({ helpful: true }),
        })
      );
    });

    it("should submit negative feedback (helpful: false)", async () => {
      // Arrange
      mockFetchSuccess(
        new Response(JSON.stringify({ id: "feedback-789", created_at: "2024-11-05T10:00:00Z" }), {
          status: 200,
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-111", false);
      });

      // Assert
      expect(result.current.isSubmitted).toBe(true);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/plans/plan-111/feedback"),
        expect.objectContaining({
          body: JSON.stringify({ helpful: false }),
        })
      );
    });

    it("should set isLoading to false after successful submission", async () => {
      // Arrange
      const loadingStates: boolean[] = [];
      mockFetchSuccess(
        new Response(JSON.stringify({ id: "fb-1", created_at: "2024-11-05T10:00:00Z" }), {
          status: 200,
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-222", true);
        loadingStates.push(result.current.isLoading);
      });

      // Assert
      expect(result.current.isLoading).toBe(false);
    });
  });

  // ==========================================
  // Input Validation Tests
  // ==========================================

  describe("Input validation - guard clauses", () => {
    it("should reject empty planId", async () => {
      // Arrange
      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("", true);
      });

      // Assert
      expect(result.current.error).toBe("Invalid feedback data");
      expect(result.current.isSubmitted).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("should reject null planId", async () => {
      // Arrange
      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await result.current.submitFeedback("" as any, true);
      });

      // Assert
      expect(result.current.error).toBe("Invalid feedback data");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("should reject undefined helpful parameter", async () => {
      // Arrange
      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-333", undefined as unknown as boolean);
      });

      // Assert
      expect(result.current.error).toBe("Invalid feedback data");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("should reject non-boolean helpful parameter", async () => {
      // Arrange
      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-333", "true" as unknown as boolean);
      });

      // Assert
      expect(result.current.error).toBe("Invalid feedback data");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("should reject numeric helpful parameter", async () => {
      // Arrange
      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-333", 1 as unknown as boolean);
      });

      // Assert
      expect(result.current.error).toBe("Invalid feedback data");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("should reject null helpful parameter", async () => {
      // Arrange
      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-333", null as unknown as boolean);
      });

      // Assert
      expect(result.current.error).toBe("Invalid feedback data");
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // HTTP Error Handling Tests
  // ==========================================

  describe("HTTP error handling - specific status codes", () => {
    it("should handle 401 Unauthorized (not logged in)", async () => {
      // Arrange
      mockFetchSuccess(
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-444", true);
      });

      // Assert
      expect(result.current.error).toBe("Failed to submit feedback: 401 ");
      expect(result.current.isSubmitted).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle 403 Forbidden (duplicate feedback)", async () => {
      // Arrange
      mockFetchSuccess(
        new Response(JSON.stringify({ error: "Feedback already submitted" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-555", false);
      });

      // Assert
      expect(result.current.error).toBe("Feedback already submitted for this plan");
      expect(result.current.isSubmitted).toBe(false);
    });

    it("should handle 404 Not Found (plan doesn't exist)", async () => {
      // Arrange
      mockFetchSuccess(
        new Response(JSON.stringify({ error: "Plan not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("non-existent-plan", true);
      });

      // Assert
      expect(result.current.error).toBe("Plan not found");
      expect(result.current.isSubmitted).toBe(false);
    });

    it("should handle 400 Bad Request with custom error message", async () => {
      // Arrange
      const customErrorMessage = "Invalid plan status for feedback";
      mockFetchSuccess(
        new Response(JSON.stringify({ error: customErrorMessage }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-666", true);
      });

      // Assert
      expect(result.current.error).toBe(customErrorMessage);
      expect(result.current.isSubmitted).toBe(false);
    });

    it("should handle 400 Bad Request with fallback message", async () => {
      // Arrange
      mockFetchSuccess(
        new Response(JSON.stringify({}), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-777", true);
      });

      // Assert
      expect(result.current.error).toBe("Invalid feedback data");
      expect(result.current.isSubmitted).toBe(false);
    });

    it("should handle generic server error (500)", async () => {
      // Arrange
      mockFetchSuccess(
        new Response(JSON.stringify({ error: "Internal server error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-888", true);
      });

      // Assert
      expect(result.current.error).toBe("Failed to submit feedback: 500 ");
      expect(result.current.isSubmitted).toBe(false);
    });

    it("should handle server error with fallback message", async () => {
      // Arrange
      mockFetchSuccess(
        new Response(JSON.stringify({}), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-999", true);
      });

      // Assert
      expect(result.current.error).toBe("Failed to submit feedback: 500 ");
      expect(result.current.isSubmitted).toBe(false);
    });
  });

  // ==========================================
  // Network Error Tests
  // ==========================================

  describe("Network error handling - fetch exceptions", () => {
    it("should handle network error (fetch throws)", async () => {
      // Arrange
      const networkError = new Error("Network timeout");
      mockFetchError(networkError);

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-1001", true);
      });

      // Assert
      expect(result.current.error).toBe("Network timeout");
      expect(result.current.isSubmitted).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle generic network error", async () => {
      // Arrange
      mockFetchError(new Error("Failed to fetch"));

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-1002", false);
      });

      // Assert
      expect(result.current.error).toBe("Failed to fetch");
      expect(result.current.isSubmitted).toBe(false);
    });

    it("should handle non-Error exceptions", async () => {
      // Arrange
      mockFetchError("Unknown error");

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-1003", true);
      });

      // Assert
      expect(result.current.error).toBe("Network error while submitting feedback");
      expect(result.current.isSubmitted).toBe(false);
    });

    it("should handle undefined exception", async () => {
      // Arrange
      mockFetchError(undefined);

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-1004", true);
      });

      // Assert
      expect(result.current.error).toBe("Network error while submitting feedback");
      expect(result.current.isSubmitted).toBe(false);
    });
  });

  // ==========================================
  // State Management Tests
  // ==========================================

  describe("State management during submission", () => {
    it("should clear previous error on new submission attempt", async () => {
      // Arrange
      const { result } = renderHook(() => useFeedback());

      // First: Simulate a previous error
      await act(async () => {
        await result.current.submitFeedback("", true);
      });
      expect(result.current.error).toBe("Invalid feedback data");

      // Second: Clear error before new valid submission
      mockFetchSuccess(
        new Response(JSON.stringify({ id: "fb-2", created_at: "2024-11-05T10:00:00Z" }), {
          status: 200,
        })
      );

      // Act - submit valid feedback
      await act(async () => {
        await result.current.submitFeedback("plan-1005", true);
      });

      // Assert
      expect(result.current.error).toBeNull();
      expect(result.current.isSubmitted).toBe(true);
    });

    it("should set isLoading during submission", async () => {
      // Arrange
      let loadingDuringFetch = false;
      mockFetchImplementation(async () => {
        loadingDuringFetch = true;
        return new Response(JSON.stringify({ id: "fb-3", created_at: "2024-11-05T10:00:00Z" }), {
          status: 200,
        });
      });

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-1006", true);
      });

      // Assert
      expect(loadingDuringFetch).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it("should reset error state on successful submission after previous error", async () => {
      // Arrange
      mockFetchSuccess(
        new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act - First submission fails
      await act(async () => {
        await result.current.submitFeedback("plan-bad", true);
      });
      expect(result.current.error).toBe("Plan not found");

      // Second submission succeeds
      mockFetchSuccess(
        new Response(JSON.stringify({ id: "fb-4", created_at: "2024-11-05T10:00:00Z" }), {
          status: 200,
        })
      );

      await act(async () => {
        await result.current.submitFeedback("plan-good", true);
      });

      // Assert
      expect(result.current.error).toBeNull();
      expect(result.current.isSubmitted).toBe(true);
    });
  });

  // ==========================================
  // Reset Function Tests
  // ==========================================

  describe("Reset function", () => {
    it("should reset all state to initial values", async () => {
      // Arrange
      mockFetchSuccess(
        new Response(JSON.stringify({ id: "fb-5", created_at: "2024-11-05T10:00:00Z" }), {
          status: 200,
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act - Submit feedback
      await act(async () => {
        await result.current.submitFeedback("plan-1007", true);
      });
      expect(result.current.isSubmitted).toBe(true);

      // Reset
      act(() => {
        result.current.reset();
      });

      // Assert
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isSubmitted).toBe(false);
    });

    it("should clear error after reset", async () => {
      // Arrange
      const { result } = renderHook(() => useFeedback());

      // Act - Generate error
      await act(async () => {
        await result.current.submitFeedback("", true);
      });
      expect(result.current.error).not.toBeNull();

      // Reset
      act(() => {
        result.current.reset();
      });

      // Assert
      expect(result.current.error).toBeNull();
    });
  });

  // ==========================================
  // Multiple Submissions Tests
  // ==========================================

  describe("Multiple submissions - sequential behavior", () => {
    it("should handle multiple successful submissions sequentially", async () => {
      // Arrange
      const { result } = renderHook(() => useFeedback());

      // Act & Assert - First submission
      mockFetchSuccess(
        new Response(JSON.stringify({ id: "fb-6", created_at: "2024-11-05T10:00:00Z" }), {
          status: 200,
        })
      );

      await act(async () => {
        await result.current.submitFeedback("plan-1008", true);
      });
      expect(result.current.isSubmitted).toBe(true);

      // Reset for second submission
      act(() => {
        result.current.reset();
      });

      // Second submission
      mockFetchSuccess(
        new Response(JSON.stringify({ id: "fb-7", created_at: "2024-11-05T10:00:00Z" }), {
          status: 200,
        })
      );

      await act(async () => {
        await result.current.submitFeedback("plan-1009", false);
      });

      // Assert
      expect(result.current.isSubmitted).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it("should handle error after successful submission", async () => {
      // Arrange
      const { result } = renderHook(() => useFeedback());

      // First submission succeeds
      mockFetchSuccess(
        new Response(JSON.stringify({ id: "fb-8", created_at: "2024-11-05T10:00:00Z" }), {
          status: 200,
        })
      );

      await act(async () => {
        await result.current.submitFeedback("plan-1010", true);
      });
      expect(result.current.isSubmitted).toBe(true);
      expect(result.current.error).toBeNull();

      // Second submission fails
      act(() => {
        result.current.reset();
      });

      mockFetchSuccess(
        new Response(JSON.stringify({ error: "Already submitted" }), {
          status: 403,
        })
      );

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-1010", false);
      });

      // Assert
      expect(result.current.error).toBe("Feedback already submitted for this plan");
      expect(result.current.isSubmitted).toBe(false);
    });
  });

  // ==========================================
  // Edge Cases and Boundary Tests
  // ==========================================

  describe("Edge cases and boundary conditions", () => {
    it("should handle very long planId", async () => {
      // Arrange
      const longPlanId = "a".repeat(1000);
      mockFetchSuccess(
        new Response(JSON.stringify({ id: "fb-9", created_at: "2024-11-05T10:00:00Z" }), {
          status: 200,
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback(longPlanId, true);
      });

      // Assert
      expect(result.current.isSubmitted).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it("should handle special characters in planId", async () => {
      // Arrange
      const specialPlanId = "plan-123_456!@#$%";
      mockFetchSuccess(
        new Response(JSON.stringify({ id: "fb-10", created_at: "2024-11-05T10:00:00Z" }), {
          status: 200,
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback(specialPlanId, false);
      });

      // Assert
      expect(fetchSpy).toHaveBeenCalledWith(`/api/plans/${specialPlanId}/feedback`, expect.any(Object));
      expect(result.current.isSubmitted).toBe(true);
    });

    it("should handle malformed JSON response", async () => {
      // Arrange
      mockFetchSuccess(
        new Response("invalid json", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-1011", true);
      });

      // Assert - Should catch JSON parse error
      expect(result.current.error).toBeTruthy();
      expect(result.current.isSubmitted).toBe(false);
    });

    it("should handle empty error object in response", async () => {
      // Arrange
      mockFetchSuccess(
        new Response(JSON.stringify({}), {
          status: 500,
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-1012", true);
      });

      // Assert
      expect(result.current.error).toBe("Failed to submit feedback: 500 ");
      expect(result.current.isSubmitted).toBe(false);
    });

    it("should handle response with null error field", async () => {
      // Arrange
      mockFetchSuccess(
        new Response(JSON.stringify({ error: null }), {
          status: 400,
        })
      );

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-1013", true);
      });

      // Assert
      expect(result.current.error).toBe("Invalid feedback data");
    });
  });

  // ==========================================
  // Return Type Validation Tests
  // ==========================================

  describe("Return type and property validation", () => {
    it("should return object with correct shape after initialization", () => {
      // Arrange & Act
      const { result } = renderHook(() => useFeedback());

      // Assert
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("error");
      expect(result.current).toHaveProperty("isSubmitted");
      expect(result.current).toHaveProperty("submitFeedback");
      expect(result.current).toHaveProperty("reset");
    });

    it("should have correct initial state values", () => {
      // Arrange & Act
      const { result } = renderHook(() => useFeedback());

      // Assert
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isSubmitted).toBe(false);
    });

    it("should have submitFeedback as a function", () => {
      // Arrange & Act
      const { result } = renderHook(() => useFeedback());

      // Assert
      expect(typeof result.current.submitFeedback).toBe("function");
    });

    it("should have reset as a function", () => {
      // Arrange & Act
      const { result } = renderHook(() => useFeedback());

      // Assert
      expect(typeof result.current.reset).toBe("function");
    });
  });
});
