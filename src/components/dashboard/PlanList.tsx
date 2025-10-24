/**
 * Plan List Component
 * Renders a grid of plan cards with infinite scroll functionality
 */

import { useEffect, useRef } from "react";
import type { PlanViewModel } from "./types";
import PlanCard from "./PlanCard.tsx";

interface PlanListProps {
  plans: PlanViewModel[];
  onLoadMore: () => void;
  isFetchingMore: boolean;
  hasMore: boolean;
}

export default function PlanList({ plans, onLoadMore, isFetchingMore, hasMore }: PlanListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  /**
   * Set up Intersection Observer for infinite scroll
   * When the sentinel element becomes visible, trigger loading more plans
   */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingMore && hasMore) {
          onLoadMore();
        }
      },
      {
        rootMargin: "200px", // Start loading when 200px away from viewport
        threshold: 0.01,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [onLoadMore, isFetchingMore, hasMore]);

  return (
    <div>
      {/* Grid of plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {/* Sentinel element for infinite scroll trigger */}
      <div ref={sentinelRef} className="flex justify-center py-8">
        {isFetchingMore && (
          <div className="flex items-center gap-2 text-slate-600">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>
            <span>Loading more plans...</span>
          </div>
        )}
        {!hasMore && plans.length > 0 && (
          <p className="text-slate-500 text-sm">You&apos;ve reached the end of your plans</p>
        )}
      </div>
    </div>
  );
}
