import React from 'react'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    type?: 'spinner' | 'dots' | 'ring' | 'ball' | 'bars' | 'infinity';
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'lg',
    type = 'infinity',
    className = ""
}) => {
    const sizeClass = {
        sm: 'loading-sm',
        md: 'loading-md',
        lg: 'loading-lg',
        xl: 'loading-xl'
    }[size];

    const typeClass = `loading-${type}`;

    return (
        <span className={`loading ${typeClass} ${sizeClass} text-primary ${className}`}></span>
    )
}

export default LoadingSpinner