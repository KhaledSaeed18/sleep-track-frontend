import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Authentication - SleepTrack",
    description: "Login or signup to SleepTrack to start tracking your sleep patterns and improve your health.",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 relative">
            {/* Return to Home Button */}
            <div className="absolute top-4 left-4 z-10">
                <Link
                    href="/"
                    className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-base-content transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                        />
                    </svg>
                    Home
                </Link>
            </div>

            {/* Main Content */}
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
}