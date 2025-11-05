/**
 * Dashboard View Component
 * Main client-side component for managing and displaying user plans
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePlans } from "../hooks/usePlans.ts";
import PlanList from "./PlanList.tsx";
import EmptyState from "./EmptyState.tsx";
import SkeletonLoader from "./SkeletonLoader.tsx";

export default function DashboardView() {
  const { plans, isLoading, error, isFetchingMore, hasMore, loadMore } = usePlans();
  const [navigatingToCreate, setNavigatingToCreate] = useState(false);

  const handleCreateNewPlan = () => {
    setNavigatingToCreate(true);
    // Navigate to plan creation wizard
    window.location.href = "/plans/new";
  };

  // Show skeleton loader while initial data is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-4xl font-bold text-slate-900">My Plans</h1>
            <Button disabled className="gap-2">
              <span>✨</span> Create New Plan
            </Button>
          </div>
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  // Show error state
  if (error && plans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-4xl font-bold text-slate-900">My Plans</h1>
            <Button onClick={handleCreateNewPlan} className="gap-2">
              <span>✨</span> Create New Plan
            </Button>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Oops! Something went wrong</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no plans exist
  if (plans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-4xl font-bold text-slate-900">My Plans</h1>
            <Button onClick={handleCreateNewPlan} className="gap-2">
              <span>✨</span> Create New Plan
            </Button>
          </div>
          <EmptyState onCreateNewPlan={handleCreateNewPlan} />
        </div>
      </div>
    );
  }

  // Show plan list
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold text-slate-900">My Plans</h1>
          <Button onClick={handleCreateNewPlan} className="gap-2" disabled={navigatingToCreate}>
            <span>✨</span> {navigatingToCreate ? "Loading..." : "Create New Plan"}
          </Button>
        </div>

        {/* Display error message if one occurs during pagination */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p className="font-semibold">⚠️ Error loading more plans: {error}</p>
          </div>
        )}

        <PlanList plans={plans} onLoadMore={loadMore} isFetchingMore={isFetchingMore} hasMore={hasMore} />
      </div>
    </div>
  );
}
