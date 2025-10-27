/**
 * Plan Actions Component
 * Displays action buttons for the plan (Edit, Save, Cancel)
 */

import { Button } from "@/components/ui/button";

interface PlanActionsProps {
  isEditing: boolean;
  isDirty: boolean;
  isDraft: boolean;
  isLoading: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function PlanActions({
  isEditing,
  isDirty,
  isDraft,
  isLoading,
  onEdit,
  onSave,
  onCancel,
}: PlanActionsProps) {
  return (
    <div className="flex gap-3 mb-8">
      {!isEditing ? (
        <Button onClick={onEdit} size="lg" variant="default">
          ✏️ Edit Plan
        </Button>
      ) : (
        <>
          {/* Save button - enabled if isDraft or isDirty */}
          <Button
            onClick={onSave}
            size="lg"
            variant="default"
            disabled={!isDraft && !isDirty || isLoading}
            className={isLoading ? "opacity-75" : ""}
          >
            {isLoading ? "💾 Saving..." : "💾 Save Plan"}
          </Button>

          {/* Cancel button */}
          <Button onClick={onCancel} size="lg" variant="outline" disabled={isLoading}>
            ✕ Cancel
          </Button>
        </>
      )}
    </div>
  );
}
