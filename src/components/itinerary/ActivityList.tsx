/**
 * Activity List Component
 * Renders activities grouped and displayed by day
 */

import ActivityItem from "./ActivityItem";
import type { PlanActivityDTO } from "@/types";

interface DayViewModel {
  dayNumber: number;
  activities: PlanActivityDTO[];
}

interface ActivityListProps {
  days: DayViewModel[];
  isEditing: boolean;
  onMoveUp: (activityId: string) => void;
  onMoveDown: (activityId: string) => void;
  onDelete: (activityId: string) => void;
}

export default function ActivityList({ days, isEditing, onMoveUp, onMoveDown, onDelete }: ActivityListProps) {
  // Handle empty state
  if (days.length === 0 || days.every((day) => day.activities.length === 0)) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">No activities scheduled for this trip.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {days.map((day) => (
        <div key={day.dayNumber}>
          {/* Day Header */}
          <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b-2 border-blue-500">Day {day.dayNumber}</h3>

          {/* Activities for this day */}
          <div className="space-y-3">
            {day.activities.length === 0 ? (
              <p className="text-slate-500 italic text-sm">No activities scheduled for this day.</p>
            ) : (
              day.activities.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  isEditing={isEditing}
                  isFirst={index === 0}
                  isLast={index === day.activities.length - 1}
                  onMoveUp={onMoveUp}
                  onMoveDown={onMoveDown}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
