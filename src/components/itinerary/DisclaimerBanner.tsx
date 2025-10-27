/**
 * Disclaimer Banner Component
 * Displays important disclaimer about the AI-generated plan
 */

export default function DisclaimerBanner() {
  const DISCLAIMER = "This is an AI-generated itinerary. Please verify all details before your trip.";

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8 rounded">
      <div className="flex gap-3">
        <div className="text-2xl flex-shrink-0">⚠️</div>
        <div>
          <h3 className="font-semibold text-amber-900 mb-1">Disclaimer</h3>
          <p className="text-sm text-amber-800">{DISCLAIMER}</p>
        </div>
      </div>
    </div>
  );
}
