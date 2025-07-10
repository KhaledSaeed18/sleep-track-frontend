import Link from "next/link";
import { MdBedtime, MdBarChart, MdStar, MdTrendingUp, MdCalendarToday } from "react-icons/md";

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <div className="hero min-h-[calc(100vh-64px)] relative overflow-hidden">
        {/* Hero Content with floating animation */}
        <div className="hero-content text-center relative z-10">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-primary mb-4 drop-shadow-lg animate-float-slow">
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
