/**
 * Plan Card Component
 * Displays a summary of a single travel plan as a clickable card
 */

import { fetchPlanById } from "@/lib/api-client";
import type { PlanViewModel } from "./types";

interface PlanCardProps {
  plan: PlanViewModel;
}

const planClicked = async (plan: PlanViewModel) => {
  const planWithActivities = await fetchPlanById(plan.id);
  sessionStorage.setItem("generatedPlan", JSON.stringify(planWithActivities));
  window.location.href = `/plans/view`;
};

export default function PlanCard({ plan }: PlanCardProps) {
  return (
    <a
      onClick={() => planClicked(plan)}
      className="group block rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-blue-300"
    >
      <div className="p-6">
        {/* Header: City name and status badge */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {plan.cityName}
          </h3>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              plan.status === "active"
                ? "bg-green-100 text-green-800"
                : plan.status === "draft"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-800"
            }`}
          >
            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
          </span>
        </div>

        {/* Duration and intensity */}
        <div className="mb-4">
          <p className="text-sm font-medium text-slate-600">{plan.displayDuration}</p>
          <p className="text-xs text-slate-500 capitalize">{plan.tripIntensity} intensity</p>
        </div>

        {/* Footer: Created date */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">{plan.displayCreatedAt}</p>
        </div>
      </div>
    </a>
  );
}
