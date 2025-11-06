/**
 * Unit tests for FeedbackWidget component
 * Tests cover rendering logic, session storage integration, user interaction, and UI state
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import FeedbackWidget from "./FeedbackWidget";

// Mock the useFeedback hook
vi.mock("../hooks/useFeedback", () => ({
  useFeedback: vi.fn(),
}));

import { useFeedback } from "../hooks/useFeedback";

describe("FeedbackWidget", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Clear session storage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  // ============================================================================
  // 1. RENDERING AND VISIBILITY LOGIC
  // ============================================================================

  describe("Rendering and Visibility Logic", () => {
    it("renders correctly when a valid planId is passed and other conditions are met", () => {
      // Arrange
      const mockSubmitFeedback = vi.fn();
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: mockSubmitFeedback,
        reset: vi.fn(),
      });

      // Act
      render(
        <FeedbackWidget planId="valid-plan-id" isDraft={false} hasFeedback={false} />
      );

      // Assert
      expect(screen.getByRole("region", { name: /plan feedback form/i })).toBeInTheDocument();
      expect(screen.getByText(/was this plan helpful\?/i)).toBeInTheDocument();
    });

    it("renders correctly when planId is retrieved from sessionStorage", () => {
      // Arrange
      const mockSubmitFeedback = vi.fn();
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: mockSubmitFeedback,
        reset: vi.fn(),
      });

      const generatedPlan = {
        plan: {
          id: "storage-plan-id",
        },
      };
      sessionStorage.setItem("generatedPlan", JSON.stringify(generatedPlan));

      // Act
      render(<FeedbackWidget />);

      // Assert
      expect(screen.getByRole("region", { name: /plan feedback form/i })).toBeInTheDocument();
    });

    it("does not render when planId is missing from both props and sessionStorage", () => {
      // Arrange
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: vi.fn(),
        reset: vi.fn(),
      });

      // Act
      const { container } = render(<FeedbackWidget />);

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it("does not render when isDraft prop is true", () => {
      // Arrange
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: vi.fn(),
        reset: vi.fn(),
      });

      // Act
      const { container } = render(
        <FeedbackWidget planId="valid-plan-id" isDraft={true} hasFeedback={false} />
      );

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it("does not render when hasFeedback prop is true", () => {
      // Arrange
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: vi.fn(),
        reset: vi.fn(),
      });

      // Act
      const { container } = render(
        <FeedbackWidget planId="valid-plan-id" isDraft={false} hasFeedback={true} />
      );

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it("does not render when isSubmitted state from useFeedback hook is true", () => {
      // Arrange
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: true,
        submitFeedback: vi.fn(),
        reset: vi.fn(),
      });

      // Act
      const { container } = render(
        <FeedbackWidget planId="valid-plan-id" isDraft={false} hasFeedback={false} />
      );

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it("does not render when plan from sessionStorage is a draft", () => {
      // Arrange
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: vi.fn(),
        reset: vi.fn(),
      });

      const draftPlan = {
        plan: {
          id: "draft",
        },
      };
      sessionStorage.setItem("generatedPlan", JSON.stringify(draftPlan));

      // Act
      const { container } = render(<FeedbackWidget />);

      // Assert
      expect(container.firstChild).toBeNull();
    });
  });

  // ============================================================================
  // 2. SESSION STORAGE INTEGRATION
  // ============================================================================

  describe("Session Storage Integration", () => {
    it("correctly reads and uses planId from a valid generatedPlan object in sessionStorage", () => {
      // Arrange
      const mockSubmitFeedback = vi.fn();
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: mockSubmitFeedback,
        reset: vi.fn(),
      });

      const generatedPlan = {
        plan: {
          id: "storage-plan-123",
        },
      };
      sessionStorage.setItem("generatedPlan", JSON.stringify(generatedPlan));

      // Act
      render(<FeedbackWidget />);
      const yesButton = screen.getByRole("button", { name: /helpful - yes/i });
      fireEvent.click(yesButton);

      // Assert
      expect(mockSubmitFeedback).toHaveBeenCalledWith("storage-plan-123", true);
    });

    it("correctly identifies a plan as a draft from sessionStorage and hides the widget", () => {
      // Arrange
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: vi.fn(),
        reset: vi.fn(),
      });

      const draftPlan = {
        plan: {
          id: "draft",
        },
      };
      sessionStorage.setItem("generatedPlan", JSON.stringify(draftPlan));

      // Act
      const { container } = render(<FeedbackWidget />);

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it("handles cases where generatedPlan is not present in sessionStorage", () => {
      // Arrange
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: vi.fn(),
        reset: vi.fn(),
      });

      // Do not set any item in sessionStorage

      // Act
      const { container } = render(<FeedbackWidget />);

      // Assert
      expect(container.firstChild).toBeNull();
    });

    it("gracefully handles malformed or invalid JSON data in sessionStorage without crashing", () => {
      // Arrange
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: vi.fn(),
        reset: vi.fn(),
      });

      // Set invalid JSON
      sessionStorage.setItem("generatedPlan", "{ invalid json }");

      // Act & Assert
      expect(() => {
        render(<FeedbackWidget />);
      }).not.toThrow();

      // Verify widget doesn't render
      const { container } = render(<FeedbackWidget />);
      expect(container.firstChild).toBeNull();
    });
  });

  // ============================================================================
  // 3. USER INTERACTION AND EVENT HANDLING
  // ============================================================================

  describe("User Interaction and Event Handling", () => {
    it("calls submitFeedback with (activePlanId, true) when the Yes button is clicked", async () => {
      // Arrange
      const mockSubmitFeedback = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: mockSubmitFeedback,
        reset: vi.fn(),
      });

      // Act
      render(<FeedbackWidget planId="plan-123" />);
      const yesButton = screen.getByRole("button", { name: /helpful - yes/i });
      fireEvent.click(yesButton);

      // Assert
      expect(mockSubmitFeedback).toHaveBeenCalledWith("plan-123", true);
      expect(mockSubmitFeedback).toHaveBeenCalledTimes(1);
    });

    it("calls submitFeedback with (activePlanId, false) when the No button is clicked", async () => {
      // Arrange
      const mockSubmitFeedback = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: mockSubmitFeedback,
        reset: vi.fn(),
      });

      // Act
      render(<FeedbackWidget planId="plan-123" />);
      const noButton = screen.getByRole("button", { name: /helpful - no/i });
      fireEvent.click(noButton);

      // Assert
      expect(mockSubmitFeedback).toHaveBeenCalledWith("plan-123", false);
      expect(mockSubmitFeedback).toHaveBeenCalledTimes(1);
    });

    it("triggers the onFeedbackSubmitted callback function upon successful feedback submission", async () => {
      // Arrange
      const mockSubmitFeedback = vi.fn().mockResolvedValue(undefined);
      const mockOnFeedbackSubmitted = vi.fn();
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: mockSubmitFeedback,
        reset: vi.fn(),
      });

      // Act
      render(
        <FeedbackWidget planId="plan-123" onFeedbackSubmitted={mockOnFeedbackSubmitted} />
      );
      const yesButton = screen.getByRole("button", { name: /helpful - yes/i });
      fireEvent.click(yesButton);

      // Assert
      await waitFor(() => {
        expect(mockOnFeedbackSubmitted).toHaveBeenCalled();
      });
    });

    it("still calls the callback even if the user clicks while loading", async () => {
      // Arrange
      const mockSubmitFeedback = vi.fn().mockResolvedValue(undefined);
      const mockOnFeedbackSubmitted = vi.fn();
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: mockSubmitFeedback,
        reset: vi.fn(),
      });

      // Act
      render(
        <FeedbackWidget planId="plan-123" onFeedbackSubmitted={mockOnFeedbackSubmitted} />
      );

      const yesButton = screen.getByRole("button", { name: /helpful - yes/i });
      fireEvent.click(yesButton);

      // Assert
      // Verify that onFeedbackSubmitted is called after clicking
      await waitFor(() => {
        expect(mockOnFeedbackSubmitted).toHaveBeenCalled();
      });
    });
  });

  // ============================================================================
  // 4. UI STATE AND PROPS
  // ============================================================================

  describe("UI State and Props - Loading State", () => {
    it("disables both Yes and No buttons when isLoading is true", () => {
      // Arrange
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: true,
        error: null,
        isSubmitted: false,
        submitFeedback: vi.fn(),
        reset: vi.fn(),
      });

      // Act
      render(<FeedbackWidget planId="plan-123" />);
      const yesButton = screen.getByRole("button", { name: /helpful - yes/i });
      const noButton = screen.getByRole("button", { name: /helpful - no/i });

      // Assert
      expect(yesButton).toBeDisabled();
      expect(noButton).toBeDisabled();
    });

    it("changes button text to … to indicate a pending action when isLoading is true", () => {
      // Arrange
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: true,
        error: null,
        isSubmitted: false,
        submitFeedback: vi.fn(),
        reset: vi.fn(),
      });

      // Act
      render(<FeedbackWidget planId="plan-123" />);

      // Assert
      expect(screen.getAllByText("…")).toHaveLength(2);
    });
  });

  describe("UI State and Props - Error State", () => {
    it("displays the error message from the useFeedback hook when an error is present", () => {
      // Arrange
      const errorMessage = "Failed to submit feedback";
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: errorMessage,
        isSubmitted: false,
        submitFeedback: vi.fn(),
        reset: vi.fn(),
      });

      // Act
      render(<FeedbackWidget planId="plan-123" />);

      // Assert
      expect(screen.getByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
    });

    it("does not show an error message when the error state is null", () => {
      // Arrange
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: vi.fn(),
        reset: vi.fn(),
      });

      // Act
      render(<FeedbackWidget planId="plan-123" />);

      // Assert
      expect(screen.queryByText(/failed to submit/i)).not.toBeInTheDocument();
    });
  });

  describe("UI State and Props - Props Priority", () => {
    it("prioritizes planId prop over values derived from sessionStorage", async () => {
      // Arrange
      const mockSubmitFeedback = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: mockSubmitFeedback,
        reset: vi.fn(),
      });

      const generatedPlan = {
        plan: {
          id: "storage-plan-id",
        },
      };
      sessionStorage.setItem("generatedPlan", JSON.stringify(generatedPlan));

      // Act
      render(<FeedbackWidget planId="prop-plan-id" />);
      const yesButton = screen.getByRole("button", { name: /helpful - yes/i });
      fireEvent.click(yesButton);

      // Assert
      expect(mockSubmitFeedback).toHaveBeenCalledWith("prop-plan-id", true);
    });

    it("prioritizes isDraft prop over values derived from sessionStorage", () => {
      // Arrange
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: vi.fn(),
        reset: vi.fn(),
      });

      const generatedPlan = {
        plan: {
          id: "valid-plan-id",
        },
      };
      sessionStorage.setItem("generatedPlan", JSON.stringify(generatedPlan));

      // Act - pass isDraft as true in props
      const { container } = render(
        <FeedbackWidget planId="valid-plan-id" isDraft={true} />
      );

      // Assert - widget should not render because isDraft prop takes priority
      expect(container.firstChild).toBeNull();
    });
  });

  // ============================================================================
  // ADDITIONAL EDGE CASES
  // ============================================================================

  describe("Additional Edge Cases", () => {
    it("renders the feedback form with proper accessibility attributes", () => {
      // Arrange
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: vi.fn(),
        reset: vi.fn(),
      });

      // Act
      render(<FeedbackWidget planId="plan-123" />);

      // Assert
      const region = screen.getByRole("region", { name: /plan feedback form/i });
      expect(region).toHaveAttribute("role", "region");
      expect(region).toHaveAttribute("aria-label", "Plan feedback form");
    });

    it("renders yes button with correct aria-label", () => {
      // Arrange
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: vi.fn(),
        reset: vi.fn(),
      });

      // Act
      render(<FeedbackWidget planId="plan-123" />);

      // Assert
      const yesButton = screen.getByRole("button", { name: /helpful - yes/i });
      expect(yesButton).toHaveAttribute("aria-label", "Helpful - Yes");
    });

    it("renders no button with correct aria-label", () => {
      // Arrange
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: vi.fn(),
        reset: vi.fn(),
      });

      // Act
      render(<FeedbackWidget planId="plan-123" />);

      // Assert
      const noButton = screen.getByRole("button", { name: /helpful - no/i });
      expect(noButton).toHaveAttribute("aria-label", "Helpful - No");
    });

    it("renders helper text message", () => {
      // Arrange
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: vi.fn(),
        reset: vi.fn(),
      });

      // Act
      render(<FeedbackWidget planId="plan-123" />);

      // Assert
      expect(screen.getByText(/your feedback helps us improve/i)).toBeInTheDocument();
    });

    it("uses sessionStorage planId when no planId prop is provided", async () => {
      // Arrange
      const mockSubmitFeedback = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: mockSubmitFeedback,
        reset: vi.fn(),
      });

      const generatedPlan = {
        plan: {
          id: "from-storage",
        },
      };
      sessionStorage.setItem("generatedPlan", JSON.stringify(generatedPlan));

      // Act
      render(<FeedbackWidget />);
      const yesButton = screen.getByRole("button", { name: /helpful - yes/i });
      fireEvent.click(yesButton);

      // Assert
      expect(mockSubmitFeedback).toHaveBeenCalledWith("from-storage", true);
    });

    it("handles complex sessionStorage generatedPlan objects with additional properties", () => {
      // Arrange
      const mockSubmitFeedback = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useFeedback).mockReturnValue({
        isLoading: false,
        error: null,
        isSubmitted: false,
        submitFeedback: mockSubmitFeedback,
        reset: vi.fn(),
      });

      const complexPlan = {
        plan: {
          id: "complex-plan-id",
          city: {
            name: "New York",
          },
          activities: [],
          metadata: {
            created: "2023-01-01",
          },
        },
        extra: "data",
      };
      sessionStorage.setItem("generatedPlan", JSON.stringify(complexPlan));

      // Act
      render(<FeedbackWidget />);
      const noButton = screen.getByRole("button", { name: /helpful - no/i });
      fireEvent.click(noButton);

      // Assert
      expect(mockSubmitFeedback).toHaveBeenCalledWith("complex-plan-id", false);
    });
  });
});

