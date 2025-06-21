"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { AuthLoadingScreen } from "@/components";

interface AuthGuardProps {
    children: React.ReactNode;
    fallbackRoute?: string;
}

export default function AuthGuard({
    children,
    fallbackRoute = "/auth/login"
}: AuthGuardProps) {
    const { isAuthenticated, isHydrated, setHydrated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isHydrated) {
            setHydrated(true);
        }
    }, [isHydrated, setHydrated]);

    useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.push(fallbackRoute);
        }
    }, [isAuthenticated, isHydrated, router, fallbackRoute]);  
    if (!isHydrated) {
        return (
            <AuthLoadingScreen
                variant="dashboard"
                message="Loading..."
                submessage="Initializing your account"
            />
        );
    }

    if (!isAuthenticated && isHydrated) {
        return (
            <AuthLoadingScreen
                variant="dashboard"
                message="Checking authentication..."
                submessage="Redirecting to login"
            />
        );
    }

    // Render children only if authenticated and hydrated
    return <>{children}</>;
}
