"use client";

import React from 'react';
import { LoadingSpinner } from '@/components';

interface FormLoadingOverlayProps {
    isVisible: boolean;
    message?: string;
}

const FormLoadingOverlay: React.FC<FormLoadingOverlayProps> = ({
    isVisible,
    message = "Processing..."
}) => {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 bg-base-100/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="text-center">
                <LoadingSpinner size="lg" type="infinity" className="mb-3" />
                <p className="text-base-content/70 font-medium">{message}</p>
            </div>
        </div>
    );
};

export default FormLoadingOverlay;
