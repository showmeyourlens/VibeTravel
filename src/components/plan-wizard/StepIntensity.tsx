import { Button } from "@/components/ui/button";

interface StepIntensityProps {
  selectedIntensity: "full day" | "half day" | null;
  onSelect: (intensity: "full day" | "half day") => void;
}

export default function StepIntensity({ selectedIntensity, onSelect }: StepIntensityProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">What's your travel pace?</h2>
        <p className="text-slate-600">Choose how packed you want your itinerary to be</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {/* Half Day Option */}
        <Button
          onClick={() => onSelect("half day")}
          variant={selectedIntensity === "half day" ? "default" : "outline"}
          className="h-auto py-6 px-4 flex flex-col items-center justify-center space-y-2"
          data-testid="btn-select-intensity-half-day"
        >
          <span className="text-3xl">🌅</span>
          <span className="font-semibold">Half Day</span>
          <span className="text-xs text-center opacity-80">Relaxed pace with free time</span>
        </Button>

        {/* Full Day Option */}
        <Button
          onClick={() => onSelect("full day")}
          variant={selectedIntensity === "full day" ? "default" : "outline"}
          className="h-auto py-6 px-4 flex flex-col items-center justify-center space-y-2"
          data-testid="btn-select-intensity-full-day"
        >
          <span className="text-3xl">🚀</span>
          <span className="font-semibold">Full Day</span>
          <span className="text-xs text-center opacity-80">Packed with activities</span>
        </Button>
      </div>

      {selectedIntensity !== null && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold capitalize">{selectedIntensity}</span> intensity selected -{" "}
            {selectedIntensity === "half day"
              ? "You'll have time to explore at your own pace"
              : "Your days will be filled with exciting activities"}
          </p>
        </div>
      )}
    </div>
  );
}
