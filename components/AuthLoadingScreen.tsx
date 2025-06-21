"use client";

import React from 'react';
import { LoadingSpinner } from '@/components';

interface AuthLoadingScreenProps {
    message?: string;
    submessage?: string;
    variant?: 'auth' | 'dashboard';
}

const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
    message = "Loading...",
    submessage,
}) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="text-center mx-auto px-4">
                {/* Loading Spinner */}
                <LoadingSpinner size="lg" type="infinity" className="mb-6" />

                {/* App Name */}
                <h2 className="text-2xl font-bold text-base-content/90 mb-2">SleepTrack</h2>

                {/* Primary Message */}
                <p className="text-base-content/70 mb-2 font-medium">{message}</p>

                {/* Secondary Message */}
                {submessage && (
                    <p className="text-sm text-base-content/50">{submessage}</p>
                )}

                {/* Subtle animation dots */}
                <div className="flex justify-center space-x-1 mt-4">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse delay-0"></div>
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse delay-300"></div>
                </div>
            </div>
        </div>
    );
};

export default AuthLoadingScreen;
