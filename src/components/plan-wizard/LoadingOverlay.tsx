interface LoadingOverlayProps {
  isVisible: boolean;
}

export default function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-12 text-center max-w-sm">
        {/* Spinner Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
          </div>
        </div>

        {/* Loading Text */}
        <h3 className="text-xl font-bold text-slate-900 mb-2">Generating your plan...</h3>
        <p className="text-slate-600">Our AI is crafting your perfect itinerary. This may take a moment.</p>

        {/* Animated Dots */}
        <div className="flex justify-center gap-1 mt-6">
          <span
            className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          ></span>
          <span
            className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></span>
          <span
            className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></span>
        </div>
      </div>
    </div>
  );
}
