import { Button } from "@/components/ui/button";
import { usePlanWizard } from "./usePlanWizard.ts";
import StepIndicator from "./StepIndicator.tsx";
import StepDestination from "./StepDestination.tsx";
import StepDuration from "./StepDuration.tsx";
import StepIntensity from "./StepIntensity.tsx";
import StepNotes from "./StepNotes.tsx";
import LoadingOverlay from "./LoadingOverlay.tsx";

const TOTAL_STEPS = 4;

export default function PlanWizard() {
  const {
    currentStep,
    formData,
    cities,
    isLoading,
    isFetching,
    error,
    handleNext,
    handlePrev,
    updateFormData,
    generatePlan,
    isStepValid,
  } = usePlanWizard();

  // Show loading state while fetching cities
  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="inline-block">
            <div className="animate-spin">⏳</div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-4">Loading wizard...</h2>
          <p className="text-slate-600 mt-2">Preparing your travel planning experience</p>
        </div>
      </div>
    );
  }

  // Show error state if cities failed to load
  if (error && cities.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Unable to Load Wizard</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoadingOverlay isVisible={isLoading} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Create Your Perfect Trip</h1>
            <p className="text-lg text-slate-600">Answer a few questions and let AI craft your ideal itinerary</p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                <p className="font-semibold">⚠️ {error}</p>
              </div>
            )}

            {/* Step Content */}
            <div className="min-h-[300px]">
              {currentStep === 1 && (
                <StepDestination
                  cities={cities}
                  selectedCityId={formData.cityId}
                  onSelect={(cityId: string) => updateFormData({ cityId }, true)}
                />
              )}

              {currentStep === 2 && (
                <StepDuration
                  selectedDuration={formData.durationDays}
                  onSelect={(durationDays: number) => updateFormData({ durationDays }, true)}
                />
              )}

              {currentStep === 3 && (
                <StepIntensity
                  selectedIntensity={formData.tripIntensity}
                  onSelect={(tripIntensity: "full day" | "half day") => updateFormData({ tripIntensity }, true)}
                />
              )}

              {currentStep === 4 && (
                <StepNotes
                  notes={formData.userNotes}
                  onChange={(userNotes: string) => updateFormData({ userNotes })}
                  onGenerate={generatePlan}
                  isGenerating={isLoading}
                />
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          {currentStep > 1 && (
            <div className="flex justify-start">
              <Button onClick={handlePrev} variant="outline" disabled={isLoading}>
                ← Back
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
