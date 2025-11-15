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
        className="bg-card/90 border-2 transition-all group-hover:bg-card group-hover:shadow-lg group-hover:border-primary h-full"
      >
        <CardHeader>
          <CardTitle className="text-secondary-foreground text-lg transition-colors group-hover:text-primary">
            {plan.cityName}
          </CardTitle>
          <CardAction>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                plan.status === "active"
                  ? "bg-green-100 text-green-800"
                  : plan.status === "draft"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 "
              }`}
            >
              {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
            </span>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-secondary-foreground text-sm font-medium group-hover:text-primary">
            {plan.displayDuration}
          </p>
          <p className="text-secondary-foreground text-xs capitalize group-hover:text-primary">
            {plan.tripIntensity} intensity
          </p>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <p className="text-secondary-foreground text-xs group-hover:text-primary">{plan.displayCreatedAt}</p>
        </CardFooter>
      </Card>
    </div>
  );
}
