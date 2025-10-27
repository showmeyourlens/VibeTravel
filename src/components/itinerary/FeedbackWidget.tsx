/**
 * Feedback Widget Component
 * Allows users to provide feedback about the generated plan
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      return;
    }

    try {
      // TODO: Integrate with backend feedback API
      // await submitFeedback(feedback);
      setSubmitted(true);
      setFeedback("");

      // Reset after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setIsOpen(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          💬 Feedback
        </Button>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-4 w-80 border border-slate-200">
          {submitted ? (
            <div className="text-center py-4">
              <p className="text-green-600 font-semibold">✓ Thank you for your feedback!</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-slate-900">Help us improve</h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-500 hover:text-slate-700"
                  aria-label="Close feedback widget"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={!feedback.trim()} size="sm" variant="default">
                  Send
                </Button>
                <Button onClick={() => setIsOpen(false)} size="sm" variant="outline">
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
