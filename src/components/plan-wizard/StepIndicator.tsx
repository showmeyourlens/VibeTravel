interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-3">
      {/* Progress Text */}
      <div className="flex justify-between items-center">
        <p className="text-sm font-semibold text-slate-700">
          Step {currentStep} of {totalSteps}
        </p>
        <p className="text-sm text-slate-600">{progress.toFixed(0)}%</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div className="bg-primary h-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
