"use client";

import { useAuth } from "@/hooks/auth/useAuth";
import { useUpdateUserProfile, useResetPassword, useDeleteAccount } from "@/hooks/user/useUser";
import { useAuthStore } from "@/store";
import { useState } from "react";

export default function UserProfileCard() {
    const { user, userFullName, userInitials } = useAuth();
    const [showDetails, setShowDetails] = useState(false);
    // Retro tab state
    const [activeTab, setActiveTab] = useState<'details' | 'update' | 'reset' | 'delete'>('details');
    // Update Profile State
    const [profileForm, setProfileForm] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        date_of_birth: user?.date_of_birth ? user.date_of_birth.slice(0, 10) : '',
    });
    const [profileMsg, setProfileMsg] = useState<string | null>(null);
    const { updateProfile, loading: updating, error: updateError } = useUpdateUserProfile();
    // Reset Password State
    const [passForm, setPassForm] = useState({ old_password: '', new_password: '' });
    const [passMsg, setPassMsg] = useState<string | null>(null);
    const { resetPassword, loading: resetting, error: resetError } = useResetPassword();
    // Delete Account State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { deleteAccount, loading: deleting, error: deleteError } = useDeleteAccount();
    const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
    // Zustand store
    const logout = useAuthStore((s) => s.logout);
    const setUser = useAuthStore((s) => s.setHydrated);
    const setAuthUser = useAuthStore((s) => s.user);

    if (!user) return null;

    // Handlers
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    };
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMsg(null);
        try {
            const updated = await updateProfile(profileForm);
            setProfileMsg('Profile updated!');
            // Update Zustand user
            useAuthStore.setState({ user: updated });
        } catch { }
    };
    const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassForm({ ...passForm, [e.target.name]: e.target.value });
    };
    const handlePassSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassMsg(null);
        try {
            const res = await resetPassword(passForm);
            setPassMsg(res.message || 'Password reset!');
            setPassForm({ old_password: '', new_password: '' });
        } catch { }
    };
    const handleDelete = async () => {
        setDeleteMsg(null);
        try {
            const res = await deleteAccount();
            setDeleteMsg(res.message || 'Account deleted!');
            logout();
        } catch { }
    };

    return (
        <div className="card bg-base-200 shadow-xl mb-8">
            <div className="card-body">
                {/* Retro Tabs */}
                <div className="tabs tabs-border mb-4">
                    <a className={`tab${activeTab === 'details' ? " tab-active" : ""}`} onClick={() => setActiveTab('details')}>Profile</a>
                    <a className={`tab${activeTab === 'update' ? " tab-active" : ""}`} onClick={() => setActiveTab('update')}>Update Profile</a>
                    <a className={`tab${activeTab === 'reset' ? " tab-active" : ""}`} onClick={() => setActiveTab('reset')}>Reset Password</a>
                    <a className={`tab${activeTab === 'delete' ? " tab-active" : ""}`} onClick={() => setActiveTab('delete')}>Delete Account</a>
                </div>
                {/* Details Tab */}
                {activeTab === 'details' && (
                    <>
                        <div className="flex items-center gap-4">
                            <div className="avatar avatar-placeholder">
                                <div className="bg-neutral text-neutral-content w-12 rounded-full">
                                    <span className="text-xl">{userInitials}</span>
                                </div>
                            </div>
                            <div>
                                <h2 className="card-title text-2xl retro-font">{userFullName}</h2>
                                <p className="text-base-content/70">{user.email}</p>
                            </div>
                        </div>
                        <button className="btn btn-sm btn-outline mt-4" onClick={() => setShowDetails((prev) => !prev)}>
                            {showDetails ? "Hide Details" : "Show Details"}
                        </button>
                        {showDetails && (
                            <>
                                <div className="divider"></div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <div className="stat">
                                        <div className="stat-title">Date of Birth</div>
                                        <div className="stat-value text-lg">{new Date(user.date_of_birth).toLocaleDateString()}</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-title">Member Since</div>
                                        <div className="stat-value text-lg">{new Date(user.created_at).toLocaleString()}</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-title">Account Status</div>
                                        <div className="stat-value text-lg text-success">Active</div>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
                {/* Update Profile Tab */}
                {activeTab === 'update' && (
                    <form className="space-y-4" onSubmit={handleProfileSubmit}>
                        <div className="form-control space-x-2">
                            <label className="label">First Name:</label>
                            <input type="text" name="first_name" className="input input-bordered input-accent retro-input" value={profileForm.first_name} onChange={handleProfileChange} required />
                        </div>
                        <div className="form-control space-x-2">
                            <label className="label">Last Name:</label>
                            <input type="text" name="last_name" className="input input-bordered input-accent retro-input" value={profileForm.last_name} onChange={handleProfileChange} required />
                        </div>
                        <div className="form-control space-x-2">
                            <label className="label">Date of Birth:</label>
                            <input type="date" name="date_of_birth" className="input input-bordered input-accent retro-input" value={profileForm.date_of_birth} onChange={handleProfileChange} required />
                        </div>
                        <button className="btn btn-primary btn-block retro-btn" disabled={updating}>Update Profile</button>
                        {profileMsg && <div className="alert alert-success mt-2 retro-alert">{profileMsg}</div>}
                        {updateError && <div className="alert alert-error mt-2 retro-alert">{updateError}</div>}
                    </form>
                )}
                {/* Reset Password Tab */}
                {activeTab === 'reset' && (
                    <form className="space-y-4" onSubmit={handlePassSubmit}>
                        <div className="form-control space-x-2">
                            <label className="label">Old Password:</label>
                            <input type="password" name="old_password" className="input input-bordered input-warning retro-input" value={passForm.old_password} onChange={handlePassChange} required />
                        </div>
                        <div className="form-control space-x-2">
                            <label className="label">New Password:</label>
                            <input type="password" name="new_password" className="input input-bordered input-warning retro-input" value={passForm.new_password} onChange={handlePassChange} required />
                        </div>
                        <button className="btn btn-warning btn-block retro-btn" disabled={resetting}>Reset Password</button>
                        {passMsg && <div className="alert alert-success mt-2 retro-alert">{passMsg}</div>}
                        {resetError && <div className="alert alert-error mt-2 retro-alert">{resetError}</div>}
                    </form>
                )}
                {/* Delete Account Tab */}
                {activeTab === 'delete' && (
                    <div className="flex flex-col items-center">
                        <button className="btn btn-error btn-block retro-btn" onClick={() => setShowDeleteModal(true)} disabled={deleting}>Delete My Account</button>
                        {deleteMsg && <div className="alert alert-success mt-2 retro-alert">{deleteMsg}</div>}
                        {deleteError && <div className="alert alert-error mt-2 retro-alert">{deleteError}</div>}
                        {/* DaisyUI Modal */}
                        {showDeleteModal && (
                            <div className="modal modal-open">
                                <div className="modal-box">
                                    <h3 className="font-bold text-lg text-error">Confirm Account Deletion</h3>
                                    <p className="py-4">Are you sure you want to delete your account? This action cannot be undone.</p>
                                    <div className="modal-action">
                                        <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                        <button className="btn btn-error" onClick={handleDelete} disabled={deleting}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
