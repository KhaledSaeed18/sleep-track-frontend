"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/auth/useAuth";

export default function Header() {
    const { isAuthenticated } = useAuth();

    return (
        <header className="navbar bg-base-200 sticky top-0 shadow z-50 h-10">
            <div className="container mx-auto px-4">
                <div className="navbar-start">
                    <Link href="/" className="flex gap-2 items-center text-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c0 1.657-4.03 3-9 3s-9-1.343-9-3m9 0V12m0 9v-9" />
                        </svg>
                        Sleep Tracker
                    </Link>
                </div>
                <div className="navbar-end">
                    {isAuthenticated ? (
                        <Link href="/dashboard" className="btn btn-primary">
                            Dashboard
                        </Link>
                    ) : (
                        <Link href="/auth/signup" className="btn btn-primary">
                            Sign Up
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
