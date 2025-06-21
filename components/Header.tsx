"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/auth/useAuth";

export default function Header() {
    const { isAuthenticated, userInitials, logout } = useAuth();

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
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar avatar-placeholder">
                                <div className="bg-neutral text-neutral-content w-12 rounded-full">
                                    <span>{userInitials}</span>
                                </div>
                            </div>
                            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                                <li>
                                    <Link href="/dashboard">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v1H8V5z" />
                                        </svg>
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <button onClick={logout}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <Link href="/auth/login" className="btn btn-primary">
                            Log In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
