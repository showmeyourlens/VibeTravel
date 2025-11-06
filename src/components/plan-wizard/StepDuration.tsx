import { Button } from "@/components/ui/button";

interface StepDurationProps {
  selectedDuration: number | null;
  onSelect: (duration: number) => void;
}

const DURATION_OPTIONS = [1, 2, 3, 4, 5];

export default function StepDuration({ selectedDuration, onSelect }: StepDurationProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">How long is your trip?</h2>
        <p className="text-slate-600">Select the duration of your stay</p>
      </div>

      <div className="flex flex-wrap gap-3 mt-6 justify-center sm:justify-start">
        {DURATION_OPTIONS.map((days) => (
          <Button
            key={days}
            onClick={() => onSelect(days)}
            variant={selectedDuration === days ? "default" : "outline"}
            size="lg"
            className="min-w-[100px] h-auto py-8 flex flex-col items-center justify-center"
            data-testid={`btn-select-duration-${days}`}
          >
            <span className="text-2xl font-bold">{days}</span>
            <span className="text-xs mt-1">{days === 1 ? "day" : "days"}</span>
          </Button>
        ))}
      </div>

      {selectedDuration !== null && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">
              {selectedDuration} {selectedDuration === 1 ? "day" : "days"}
            </span>{" "}
            selected for your trip
          </p>
        </div>
      )}
    </div>
  );
}
