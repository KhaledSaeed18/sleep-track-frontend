import type { Metadata } from "next";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

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
                    <FaArrowLeft />
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