import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <div className="hero min-h-[calc(100vh-64px)] relative overflow-hidden">
        {/* Animated SVG background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          viewBox="0 0 1440 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="1200"
            cy="120"
            r="80"
            fill="#fbbf24"
            fillOpacity="0.2"
          >
            <animate
              attributeName="r"
              values="80;100;80"
              dur="6s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx="300"
            cy="80"
            r="40"
            fill="#60a5fa"
            fillOpacity="0.15"
          >
            <animate
              attributeName="r"
              values="40;60;40"
              dur="8s"
              repeatCount="indefinite"
            />
          </circle>
          {/* Stars */}
          <circle cx="200" cy="200" r="2" fill="#fff">
            <animate
              attributeName="cy"
              values="200;210;200"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="400" cy="150" r="1.5" fill="#fff">
            <animate
              attributeName="cx"
              values="400;410;400"
              dur="5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="900" cy="300" r="2.5" fill="#fff">
            <animate
              attributeName="cy"
              values="300;320;300"
              dur="7s"
              repeatCount="indefinite"
            />
          </circle>
          {/* Moon */}
          <g
            className="animate-float"
            style={{ transformOrigin: "1200px 120px" }}
          >
            <circle cx="1200" cy="120" r="40" fill="#fffde4" />
            <path
              d="M1200 80a40 40 0 1 0 0 80 32 32 0 1 1 0-80z"
              fill="#fbbf24"
              fillOpacity="0.7"
            />
          </g>
        </svg>
        {/* Hero Content with floating animation */}
        <div className="hero-content text-center relative z-10">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-primary mb-4 drop-shadow-lg animate-float-slow">
              Welcome to <span className="inline-flex font-extrabold">Sleep Track</span>
            </h1>
            <p className="text-lg mb-6 text-base-content/80">
              Track your sleep patterns, analyze your rest quality, and improve
              your overall health with our comprehensive sleep tracking
              application.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signup">
                <button className="btn btn-primary shadow-lg">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
