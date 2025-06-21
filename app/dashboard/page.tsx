"use client";

import { useAuth } from "@/hooks/auth/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader, UserProfileCard } from "@/components";

export default function DashboardPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100">
            <div className="container mx-auto px-4 py-8">
                <DashboardHeader />
                <UserProfileCard />
            </div>
        </div>
    );
}