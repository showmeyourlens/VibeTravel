/**
 * Plan Card Component
 * Displays a summary of a single travel plan as a clickable card
 */

import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPlanById } from "@/lib/api-client";
import type { PlanViewModel } from "./types";
import { navigate } from "astro:transitions/client";

interface PlanCardProps {
  plan: PlanViewModel;
}

const planClicked = async (plan: PlanViewModel) => {
  const planWithActivities = await fetchPlanById(plan.id);
  sessionStorage.setItem("generatedPlan", JSON.stringify(planWithActivities));
  navigate(`/plans/view?`);
};

export default function PlanCard({ plan }: PlanCardProps) {
  return (
    <div className="group block h-full cursor-pointer">
      <Card
        onClick={() => planClicked(plan)}
        className="bg-white/90 transition-all group-hover:shadow-md group-hover:border-blue-300 h-full"
      >
        <CardHeader>
          <CardTitle className="transition-colors group-hover:text-blue-600">{plan.cityName}</CardTitle>
          <CardAction>
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
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium text-slate-600">{plan.displayDuration}</p>
          <p className="text-xs text-slate-500 capitalize">{plan.tripIntensity} intensity</p>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <p className="text-xs text-slate-500">{plan.displayCreatedAt}</p>
        </CardFooter>
      </Card>
    </div>
  );
}
