export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <div className="hero min-h-[calc(100vh-64px)]">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-primary mb-4">
              Welcome to SleepTrack
            </h1>
            <p className="text-lg mb-6">
              Track your sleep patterns, analyze your rest quality, and improve your overall health with our comprehensive sleep tracking application.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="btn btn-primary">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
