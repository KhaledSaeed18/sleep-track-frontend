import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard - SleepTrack",
    description: "View your sleep tracking dashboard and statistics",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-base-100 container mx-auto px-4">
            {children}
        </div>
    );
}