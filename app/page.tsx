import Link from "next/link";
import { MdBedtime, MdBarChart, MdStar, MdTrendingUp, MdCalendarToday } from "react-icons/md";

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <div className="hero min-h-[calc(100vh-64px)] relative overflow-hidden">
        {/* Animated Moon SVG */}
        <div className="absolute left-1/3 top-12 z-0 animate-float-slow transform -translate-x-1/4">
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
            <circle cx="48" cy="48" r="36" fill="#F3F4F6" />
            <path d="M48 12a36 36 0 1 0 36 36A27 27 0 0 1 48 12z" fill="#C7D2FE" />
            <circle cx="60" cy="42" r="4.5" fill="#A5B4FC" />
            <circle cx="39" cy="60" r="3" fill="#A5B4FC" />
          </svg>
        </div>
        {/* Animated Sun SVG */}
        <div className="absolute right-1/3 top-20 z-0 animate-rotate-slow transform translate-x-1/4">
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
            <circle cx="48" cy="48" r="24" fill="#FDE68A" />
            <g stroke="#F59E42" strokeWidth="4.5">
              <line x1="48" y1="6" x2="48" y2="30" />
              <line x1="48" y1="66" x2="48" y2="90" />
              <line x1="6" y1="48" x2="30" y2="48" />
              <line x1="66" y1="48" x2="90" y2="48" />
              <line x1="18" y1="18" x2="33" y2="33" />
              <line x1="78" y1="78" x2="63" y2="63" />
              <line x1="18" y1="78" x2="33" y2="63" />
              <line x1="78" y1="18" x2="63" y2="33" />
            </g>
          </svg>
        </div>
        {/* Hero Content with floating animation */}
        <div className="hero-content text-center relative z-10">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-primary mb-4 drop-shadow-lg">
              Welcome to{" "}
              <span className="inline-flex font-extrabold">Sleep Track</span>
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
      {/* Features Grid Section */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          Features
        </h2>
        {/* Top row: 3 cards */}
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          <div className="card bg-base-100 shadow-xl w-full sm:w-[300px]">
            <div className="card-body items-center text-center">
              <span className="text-4xl text-primary mb-2">
                <MdBedtime className="inline w-10 h-10" />
              </span>
              <h3 className="card-title">Sleep Tracking</h3>
              <p>
                Log your sleep sessions and monitor your sleep patterns easily.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl w-full sm:w-[300px]">
            <div className="card-body items-center text-center">
              <span className="text-4xl text-info mb-2">
                <MdBarChart className="inline w-10 h-10" />
              </span>
              <h3 className="card-title">Analytics & Insights</h3>
              <p>
                Visualize your sleep data with interactive charts and weekly summaries.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl w-full sm:w-[300px]">
            <div className="card-body items-center text-center">
              <span className="text-4xl text-warning mb-2">
                <MdStar className="inline w-10 h-10" />
              </span>
              <h3 className="card-title">Quality Ratings</h3>
              <p>
                Rate your sleep quality and track improvements over time.
              </p>
            </div>
          </div>
        </div>
        {/* Bottom row: 2 cards centered */}
        <div className="flex flex-wrap justify-center gap-8">
          <div className="card bg-base-100 shadow-xl w-full sm:w-[300px]">
            <div className="card-body items-center text-center">
              <span className="text-4xl text-success mb-2">
                <MdTrendingUp className="inline w-10 h-10" />
              </span>
              <h3 className="card-title">Progress Tracking</h3>
              <p>
                See your sleep consistency and progress with easy-to-read stats.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl w-full sm:w-[300px]">
            <div className="card-body items-center text-center">
              <span className="text-4xl text-amber-700 mb-2">
                <MdCalendarToday className="inline w-10 h-10" />
              </span>
              <h3 className="card-title">Weekly Summary</h3>
              <p>
                Get a detailed summary of your sleep for each week.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
