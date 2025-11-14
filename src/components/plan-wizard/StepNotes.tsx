import { Button } from "@/components/ui/button";

interface StepNotesProps {
  notes: string;
  onChange: (notes: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function StepNotes({ notes, onChange, onGenerate, isGenerating }: StepNotesProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Any special preferences?</h2>
        <p className="text-slate-600">Tell us anything we should know about your trip (optional)</p>
      </div>

      <div className="mt-6 space-y-3">
        <label htmlFor="user-notes" className="block text-sm font-semibold text-slate-700">
          Additional Notes
        </label>

        <textarea
          id="user-notes"
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., I love museums and historic sites... I'm vegetarian... I prefer walkable areas..."
          className="bg-white w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={5}
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-600">{notes.length} characters</p>
          <p className="text-xs text-slate-600">Max 500 characters</p>
        </div>

        {notes.length > 0 && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Your notes:</span> &quot;{notes}&quot;
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-secondary-foreground/50 border rounded-lg">
        <p className="text-sm text-secondary">
          💡 <span className="font-semibold">Pro tip:</span> The more details you provide, the better we can personalize
          your itinerary!
        </p>
      </div>

      {/* Generate Button */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          size="lg"
          className="w-full gap-2 py-6 text-lg"
          data-testid="btn-generate-plan"
        >
          <span>✨</span> {isGenerating ? "Generating..." : "Generate My Plan"}
        </Button>
      </div>
    </div>
  );
}
