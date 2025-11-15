/**
 * Plan Metadata Component
 * Displays summary information about the trip
 */

import type { PlanDto } from "@/types";
import { Panel } from "../ui/Panel";

interface PlanMetadataProps {
  plan: PlanDto;
  userNotes?: string;
}

export default function PlanMetadata({ plan, userNotes }: PlanMetadataProps) {
  return (
    <Panel className="mb-8 text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Destination - use city_id as fallback */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide">Destination</p>
          <h2 className="text-2xl font-bold mt-1">{plan.city.name}</h2>
        </div>

        {/* Duration */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide">Duration</p>
          <p className="text-2xl font-bold mt-1">
            {plan.duration_days} Day{plan.duration_days > 1 ? "s" : ""}
          </p>
        </div>

        {/* Trip Intensity */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide">Intensity</p>
          <p className="text-2xl font-bold mt-1 capitalize">{plan.trip_intensity}</p>
        </div>
      </div>

      {/* User Notes */}
      {userNotes && (
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm font-semibold uppercase tracking-wide">Your Notes</p>
          <p className="mt-2">{userNotes}</p>
        </div>
      )}
    </Panel>
  );
}
