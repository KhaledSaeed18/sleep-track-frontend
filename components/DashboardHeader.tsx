"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { MdLogout } from "react-icons/md";

export default function DashboardHeader() {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <button
                onClick={handleLogout}
                className="btn btn-outline btn-error"
            >
                <MdLogout />
                Logout
            </button>
        </div>
    );
}
