/**
 * Disclaimer Banner Component
 * Displays important disclaimer about the AI-generated plan
 */

export default function DisclaimerBanner() {
  const DISCLAIMER = "This is an AI-generated itinerary. Please verify all details before your trip.";

  return (
    <div className="bg-secondary border border-secondary-foreground border-1 p-4 mb-8 p-4 rounded-lg shadow-2xl">
      <div className="flex gap-3">
        <div className="text-2xl flex-shrink-0">⚠️</div>
        <div>
          <h3 className="font-semibold text-secondary-foreground mb-1">Disclaimer</h3>
          <p className="text-sm text-secondary-foreground">{DISCLAIMER}</p>
        </div>
      </div>
    </div>
  );
}
