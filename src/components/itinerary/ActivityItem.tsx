/**
 * Activity Item Component
 * Displays a single activity with optional edit controls
 */

import { Button } from "@/components/ui/button";
import type { PlanActivityDTO } from "@/types";

interface ActivityItemProps {
  activity: PlanActivityDTO;
  isEditing: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: (activityId: string) => void;
  onMoveDown: (activityId: string) => void;
  onDelete: (activityId: string) => void;
}

export default function ActivityItem({
  activity,
  isEditing,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
}: ActivityItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
      {/* Activity Content */}
      <div className="flex-1">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
            #{activity.position}
          </span>
          <h4 className="text-base font-medium text-slate-900">{activity.name}</h4>
        </div>

        {/* Google Maps Link */}
        {activity.google_maps_url && (
          <a
            href={activity.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline mt-1 inline-block"
          >
            📍 View on Google Maps
          </a>
        )}
      </div>

      {/* Edit Controls */}
      {isEditing && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMoveUp(activity.id)}
            disabled={isFirst}
            aria-label="Move activity up"
            title="Move up"
          >
            ↑
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMoveDown(activity.id)}
            disabled={isLast}
            aria-label="Move activity down"
            title="Move down"
          >
            ↓
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(activity.id)}
            aria-label="Delete activity"
            title="Delete"
          >
            🗑️
          </Button>
        </div>
      )}
    </div>
  );
}
