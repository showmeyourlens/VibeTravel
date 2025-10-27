/**
 * Plan Metadata Component
 * Displays summary information about the trip
 */

import type { PlanDto } from "@/types";

interface PlanMetadataProps {
  plan: PlanDto;
  userNotes?: string;
}

export default function PlanMetadata({ plan, userNotes }: PlanMetadataProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Destination - use city_id as fallback */}
        <div>
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Destination</p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">{plan.city_id}</h2>
        </div>

        {/* Duration */}
        <div>
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Duration</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {plan.duration_days} Day{plan.duration_days > 1 ? "s" : ""}
          </p>
        </div>

        {/* Trip Intensity */}
        <div>
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Intensity</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 capitalize">{plan.trip_intensity}</p>
        </div>
      </div>

      {/* User Notes */}
      {userNotes && (
        <div className="mt-6 pt-6 border-t border-blue-200">
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Your Notes</p>
          <p className="text-slate-700 mt-2">{userNotes}</p>
        </div>
      )}
    </div>
  );
}
