"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { AuthLoadingScreen } from "@/components";

interface AuthRedirectProps {
    children: React.ReactNode;
    redirectRoute?: string;
}

export default function AuthRedirect({
    children,
    redirectRoute = "/dashboard"
}: AuthRedirectProps) {
    const { isAuthenticated, isHydrated, setHydrated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Ensure hydration is marked as complete on client side
        if (!isHydrated) {
            setHydrated(true);
        }
    }, [isHydrated, setHydrated]);

    useEffect(() => {
        // Only redirect after hydration is complete and user is authenticated
        if (isHydrated && isAuthenticated) {
            router.push(redirectRoute);
        }
    }, [isAuthenticated, isHydrated, router, redirectRoute]);    // Show loading screen while hydrating
    if (!isHydrated) {
        return (
            <AuthLoadingScreen
                variant="auth"
                message="Loading..."
                submessage="Preparing your experience"
            />
        );
    }

    // If authenticated after hydration, show loading while redirecting
    if (isAuthenticated) {
        return (
            <AuthLoadingScreen
                variant="auth"
                message="Welcome back!"
                submessage="Redirecting to dashboard..."
            />
        );
    }

    // Render children only if not authenticated and hydrated
    return <>{children}</>;
}
