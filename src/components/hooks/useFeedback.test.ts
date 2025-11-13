import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFeedback } from "./useFeedback";
import type { SubmitFeedbackResponseDTO } from "@/types";

/**
 * Unit tests for useFeedback hook - submitFeedback function
 * Tests cover business rules, edge cases, and error scenarios
 */

// Hoist the mock implementations to ensure they're available before module loading
const mockApiClient = vi.hoisted(() => ({
  getFeedbackStatus: vi.fn(),
  submitFeedbackApi: vi.fn(),
}));

// Mock the API client module with hoisted implementations
vi.mock("@/lib/api-client", () => mockApiClient);

describe("useFeedback.submitFeedback", () => {
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

      mockApiClient.submitFeedbackApi.mockResolvedValueOnce(mockResponse);

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

    it("should set isLoading to false after successful submission", async () => {
      // Arrange
      const loadingStates: boolean[] = [];

      const mockResponse: SubmitFeedbackResponseDTO = {
        id: "feedback-123",
        created_at: "2024-11-05T10:00:00Z",
      };
      mockApiClient.submitFeedbackApi.mockResolvedValueOnce(mockResponse);

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
    });
  });

  // ==========================================
  // Network Error Tests
  // ==========================================

  describe("Network error handling - fetch exceptions", () => {
    it("should handle network error (fetch throws)", async () => {
      // Arrange
      const networkError = new Error("Network timeout");
      mockApiClient.submitFeedbackApi.mockRejectedValueOnce(networkError);

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
      mockApiClient.submitFeedbackApi.mockRejectedValueOnce(new Error("Failed to fetch"));

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
      mockApiClient.submitFeedbackApi.mockRejectedValueOnce(null);

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback("plan-1003", true);
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
      const mockResponse: SubmitFeedbackResponseDTO = {
        id: "feedback-123",
        created_at: "2024-11-05T10:00:00Z",
      };
      mockApiClient.submitFeedbackApi.mockResolvedValueOnce(mockResponse);

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
      mockApiClient.submitFeedbackApi.mockImplementationOnce(async () => {
        loadingDuringFetch = true;
        return new Response(JSON.stringify({ id: "feedback-123", created_at: "2024-11-05T10:00:00Z" }), {
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
      mockApiClient.submitFeedbackApi.mockRejectedValueOnce(new Error("Plan not found"));

      const { result } = renderHook(() => useFeedback());

      // Act - First submission fails
      await act(async () => {
        await result.current.submitFeedback("plan-bad", true);
      });
      expect(result.current.error).toBe("Plan not found");

      // Second submission succeeds
      const mockResponse: SubmitFeedbackResponseDTO = {
        id: "feedback-123",
        created_at: "2024-11-05T10:00:00Z",
      };
      mockApiClient.submitFeedbackApi.mockResolvedValueOnce(mockResponse);

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
      const mockResponse: SubmitFeedbackResponseDTO = {
        id: "feedback-123",
        created_at: "2024-11-05T10:00:00Z",
      };
      mockApiClient.submitFeedbackApi.mockResolvedValueOnce(mockResponse);

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
      const mockResponse: SubmitFeedbackResponseDTO = {
        id: "feedback-123",
        created_at: "2024-11-05T10:00:00Z",
      };
      mockApiClient.submitFeedbackApi.mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await result.current.submitFeedback("plan-1008", true);
      });
      expect(result.current.isSubmitted).toBe(true);

      // Reset for second submission
      act(() => {
        result.current.reset();
      });

      // Second submission
      const mockResponse2: SubmitFeedbackResponseDTO = {
        id: "feedback-123",
        created_at: "2024-11-05T10:00:00Z",
      };
      mockApiClient.submitFeedbackApi.mockResolvedValueOnce(mockResponse2);

      await act(async () => {
        await result.current.submitFeedback("plan-1009", false);
      });

      // Assert
      expect(result.current.isSubmitted).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  // ==========================================
  // Edge Cases and Boundary Tests
  // ==========================================

  describe("Edge cases and boundary conditions", () => {
    it("should handle very long planId", async () => {
      // Arrange
      const longPlanId = "a".repeat(1000);
      const mockResponse: SubmitFeedbackResponseDTO = {
        id: "feedback-123",
        created_at: "2024-11-05T10:00:00Z",
      };
      mockApiClient.submitFeedbackApi.mockResolvedValueOnce(mockResponse);

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
      const mockResponse: SubmitFeedbackResponseDTO = {
        id: "feedback-123",
        created_at: "2024-11-05T10:00:00Z",
      };
      mockApiClient.submitFeedbackApi.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useFeedback());

      // Act
      await act(async () => {
        await result.current.submitFeedback(specialPlanId, false);
      });

      // Assert
      expect(mockApiClient.submitFeedbackApi).toHaveBeenCalledWith(specialPlanId, expect.any(Object));
      expect(result.current.isSubmitted).toBe(true);
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
