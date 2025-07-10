"use client";

import { DashboardHeader, UserProfileCard, AuthGuard } from "@/components";
import SleepDashboard from "@/components/SleepDashboard";

export default function DashboardPage() {
    return (
        <AuthGuard>
            <div className="min-h-screen bg-base-100">
                <div className="container mx-auto px-4 py-8 space-y-8">
                    <DashboardHeader />
                    <UserProfileCard />
                    <SleepDashboard />
                </div>
            </div>
        </AuthGuard>
    );
}