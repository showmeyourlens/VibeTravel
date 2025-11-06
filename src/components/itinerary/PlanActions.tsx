/**
 * Plan Actions Component
 * Displays action buttons for the plan (Edit, Save, Cancel, Delete)
 */

import { Button } from "@/components/ui/button";

interface PlanActionsProps {
  isEditing: boolean;
  isDirty: boolean;
  isDraft: boolean;
  isLoading: boolean;
  onEdit: () => void;
  onSave: (onDraft: boolean) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function PlanActions({
  isEditing,
  isDirty,
  isDraft,
  isLoading,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: PlanActionsProps) {
  return (
    <div className="flex gap-3 mb-8">
      {!isEditing && !isDraft && (
        <>
          <Button onClick={onEdit} size="lg" variant="default">
            ✏️ Edit Plan
          </Button>
          <Button
            onClick={onDelete}
            size="lg"
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            🗑️ Delete Plan
          </Button>
        </>
      )}
      {(isDraft || isEditing) && (
        <>
          <Button
            onClick={() => onSave(isDraft)}
            size="lg"
            variant="default"
            disabled={(!isDraft && !isDirty) || isLoading}
            className={isLoading ? "opacity-75" : ""}
            data-testid="btn-save-plan"
          >
            {isLoading ? "💾 Saving..." : "💾 Save Plan"}
          </Button>

          <Button onClick={onCancel} size="lg" variant="outline" disabled={isLoading}>
            ✕ Cancel
          </Button>
        </>
      )}
    </div>
  );
}
