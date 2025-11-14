import { Button } from "@/components/ui/button";

const LandingPage = () => {
  return (
    <div className="relative w-full mx-auto min-h-screen p-4 sm:p-8 flex items-center justify-center">
      <div className="relative w-full max-w-4xl bg-card/90 rounded-2xl shadow-2xl p-8 sm:p-12 border border-border text-foreground">
        <div className="space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Craft Your Dream European Itinerary in Seconds.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              VibeTravel uses AI to build personalized, geographically-optimized travel plans. Stop planning, start
              exploring.
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                asChild
                className="font-bold text-lg px-8 py-6 rounded-full shadow-lg transition-transform transform hover:scale-105"
              >
                <a href="/dashboard">Plan Your Trip for Free</a>
              </Button>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">1</div>
                <h3 className="text-xl font-semibold">Define Your Vibe</h3>
                <p className="text-muted-foreground">
                  Tell us your destination, trip duration, and preferred intensity.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">2</div>
                <h3 className="text-xl font-semibold">Get Your Instant Plan</h3>
                <p className="text-muted-foreground">Our AI generates a smart, day-by-day itinerary tailored to you.</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">3</div>
                <h3 className="text-xl font-semibold">Explore & Customize</h3>
                <p className="text-muted-foreground">
                  Easily modify your plan by reordering or removing activities, then save it for your trip.
                </p>
              </div>
            </div>
          </div>

          {/* Key Features Section */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center">Why Choose VibeTravel?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-foreground/5 p-6 rounded-lg border border-border text-center space-y-4 flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M9.06 11.23a3.5 3.5 0 0 0 5.88 0" />
                  <path d="M12 20.53a3.5 3.5 0 0 0 5.88 0" />
                  <path d="M12 3.47a3.5 3.5 0 0 0-5.88 0" />
                  <path d="m22 12-2.73-2.73a3.5 3.5 0 0 0-4.95 0L12 12l-2.32-2.32a3.5 3.5 0 0 0-4.95 0L2 12l2.73 2.73a3.5 3.5 0 0 0 4.95 0L12 12l2.32 2.32a3.5 3.5 0 0 0 4.95 0L22 12Z" />
                </svg>
                <h3 className="text-xl font-semibold">AI-Powered Planning</h3>
                <p className="text-muted-foreground">
                  Our intelligent system crafts daily plans that are perfectly paced and logically sequenced.
                </p>
              </div>
              <div className="bg-foreground/5 p-6 rounded-lg border border-border text-center space-y-4 flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 22c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Z" />
                  <path d="M12 6V2" />
                  <path d="m6.44 8.5-3-2.6" />
                  <path d="M21.56 8.5-18.6 6" />
                  <path d="M12 18v4" />
                  <path d="m6.44 15.5-3 2.6" />
                  <path d="m21.56 15.5 2.94 2.54" />
                  <path d="M4 12H2" />
                  <path d="M22 12h-2" />
                  <path d="M15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" />
                </svg>
                <h3 className="text-xl font-semibold">Geographically Optimized</h3>
                <p className="text-muted-foreground">
                  We optimize your daily routes to minimize travel time, so you can spend more time enjoying the sights.
                </p>
              </div>
              <div className="bg-foreground/5 p-6 rounded-lg border border-border text-center space-y-4 flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M21.28 2.22a2.43 2.43 0 0 0-2.05-1.32 2.42 2.42 0 0 0-1.21.37L5.35 6.8a2.4 2.4 0 0 0-1.38 2.14v0a2.4 2.4 0 0 0 .58 1.58l5.4 5.4a2.4 2.4 0 0 0 1.58.58h0a2.4 2.4 0 0 0 2.14-1.38l5.53-12.67a2.42 2.42 0 0 0 .37-1.21 2.43 2.43 0 0 0-1.32-2.05Z" />
                  <path d="M11 13 8 9" />
                  <path d="m22 2-2.5 2.5" />
                  <path d="m14 6 3 3" />
                  <path d="M17 11 11 17" />
                  <path d="m10 14-1.5 1.5" />
                  <path d="M3.5 18.5 2 22" />
                </svg>
                <h3 className="text-xl font-semibold">Fully Customizable</h3>
                <p className="text-muted-foreground">
                  Easily reorder or remove activities to match your style. Your trip, your rules.
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Ready for Your Next Adventure?</h2>
            <div className="pt-2">
              <Button
                size="lg"
                asChild
                className="font-bold text-lg px-8 py-6 rounded-full shadow-lg transition-transform transform hover:scale-105"
              >
                <a href="/dashboard">Plan Your Trip for Free</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
