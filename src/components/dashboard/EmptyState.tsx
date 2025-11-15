/**
 * Empty State Component
 * Displayed when the user has no saved plans
 */

import { Button } from "@/components/ui/button";
import { Panel } from "../ui/Panel";

interface EmptyStateProps {
  onCreateNewPlan: () => void;
}

export default function EmptyState({ onCreateNewPlan }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center">
      <Panel className="text-center max-w-md mx-auto p-8">
        {/* Icon/Graphic */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary border-2">
            <span className="text-5xl">🗺️</span>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-bold mb-3">No plans yet</h2>

        {/* Description */}
        <p className="mb-8 leading-relaxed">
          Start planning your next adventure! Create a new travel plan to explore amazing destinations and activities.
        </p>

        {/* Call to action */}
        <Button onClick={onCreateNewPlan} className="gap-2 w-full sm:w-auto" data-testid="btn-create-first-plan">
          <span>✨</span> Create Your First Plan
        </Button>
      </Panel>
    </div>
  );
}
