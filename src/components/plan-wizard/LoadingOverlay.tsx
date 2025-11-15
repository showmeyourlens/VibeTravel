interface LoadingOverlayProps {
  isVisible: boolean;
}

export default function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="loading-overlay">
      <div className="bg-white rounded-lg shadow-2xl p-12 text-center max-w-sm">
        {/* Spinner Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>
          </div>
        </div>

        {/* Loading Text */}
        <h3 className="text-xl font-bold mb-2">Generating your plan...</h3>
        <p>Our AI is crafting your perfect itinerary. This may take a moment.</p>

        {/* Animated Dots */}
        <div className="flex justify-center gap-1 mt-6">
          <span
            className="inline-block w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          ></span>
          <span
            className="inline-block w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></span>
          <span
            className="inline-block w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></span>
        </div>
      </div>
    </div>
  );
}
