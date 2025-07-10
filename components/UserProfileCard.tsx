"use client";

import { useAuth } from "@/hooks/auth/useAuth";

export default function UserProfileCard() {
    const { user, userFullName, userInitials } = useAuth();

    if (!user) {
        return null;
    }

    return (
        <div className="card bg-base-200 shadow-xl mb-8">
            <div className="card-body">
                <div className="flex items-center gap-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
    );
}
