"use client";

import { useAuth } from "@/hooks/auth/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { user, isAuthenticated, logout, userFullName, userInitials } = useAuth();
    const router = useRouter();

    // Redirect to login if not authenticated
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

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-base-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="btn btn-outline btn-error"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        Logout
                    </button>
                </div>

                {/* User Profile Card */}
                <div className="card bg-base-200 shadow-xl mb-8">
                    <div className="card-body">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="avatar avatar-placeholder">
                                <div className="bg-neutral text-neutral-content w-12 rounded-full">
                                    <span className="text-xl">{userInitials}</span>
                                </div>
                            </div>
                            <div>
                                <h2 className="card-title text-2xl">{userFullName}</h2>
                                <p className="text-base-content/70">{user.email}</p>
                            </div>
                        </div>

                        <div className="divider"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="stat">
                                <div className="stat-title">User ID</div>
                                <div className="stat-value text-lg">{user.id}</div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Date of Birth</div>
                                <div className="stat-value text-lg">
                                    {new Date(user.date_of_birth).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Member Since</div>
                                <div className="stat-value text-lg">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Account Status</div>
                                <div className="stat-value text-lg text-success">Active</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}