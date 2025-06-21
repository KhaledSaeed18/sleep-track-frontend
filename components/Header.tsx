"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/auth/useAuth";
import { MdLogout, MdOutlineDashboard } from "react-icons/md";

export default function Header() {
    const { isAuthenticated, userInitials, logout } = useAuth();

    return (
        <header className="navbar bg-base-200 sticky top-0 shadow z-50 h-10">
            <div className="container mx-auto px-4">
                <div className="navbar-start">
                    <Link href="/" className="flex gap-2 items-center text-xl">
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
                                        <MdOutlineDashboard />
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <button onClick={logout}>
                                        <MdLogout />
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
