"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";

export default function SignUpPage() {
    const router = useRouter();
    const { signup, isLoading, error, clearError, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        dateOfBirth: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        // Transform form data to match API requirements
        const signupData = {
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            date_of_birth: formData.dateOfBirth,
            password: formData.password,
        };

        const result = await signup(signupData);

        if (result.success) {
            router.push('/dashboard');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const nextStep = () => {
        if (step < 2) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const isStep1Valid = formData.firstName && formData.lastName && formData.dateOfBirth;
    const isStep2Valid = formData.email && formData.password;

    return (
        <div className="card bg-base-100 shadow-2xl border-2 border-primary/20">
            <div className="card-body">
                {/* Header with moon icon */}
                <div className="text-center mb-2">
                    <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-8 h-8 text-primary"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Join SleepTrack</h1>
                    <p className="text-base-content/70">Start your journey to better sleep</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center mb-4">
                    <ul className="steps steps-horizontal">
                        <li className={`step ${step >= 1 ? "step-primary" : ""}`}>Personal Info</li>
                        <li className={`step ${step >= 2 ? "step-primary" : ""}`}>Account Setup</li>
                    </ul>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4">
                            {/* First Name and Last Name */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">First Name</span>
                                    </label>                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="firstName"
                                            placeholder="John"
                                            className="input input-bordered input-primary w-full pl-10"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60 pointer-events-none z-10"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Last Name</span>
                                    </label>                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="lastName"
                                            placeholder="Doe"
                                            className="input input-bordered input-primary w-full pl-10"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60 pointer-events-none z-10"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Date of Birth */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Date of Birth</span>
                                </label>                                <div className="relative">
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        className="input input-bordered input-primary w-full pl-10"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        required
                                    />
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60 pointer-events-none z-10"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
                                        />
                                    </svg>
                                </div>
                                <label className="label">
                                    <span className="label-text-alt text-primary/70">We use this to personalize your sleep insights</span>
                                </label>
                            </div>

                            {/* Next Button */}
                            <button
                                type="button"
                                className="btn btn-primary w-full"
                                onClick={nextStep}
                                disabled={!isStep1Valid}
                            >
                                Continue
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            {/* Email Input */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Email Address</span>
                                </label>                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="john.doe@example.com"
                                        className="input input-bordered input-primary w-full pl-10"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60 pointer-events-none z-10"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Password</span>
                                </label>                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Create a strong password"
                                        className="input input-bordered input-primary w-full pl-10 pr-10"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60 pointer-events-none z-10"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                                        />
                                    </svg>
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary/60 hover:text-primary"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="w-5 h-5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="w-5 h-5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <label className="label">
                                    <span className="label-text-alt text-primary/70">Must be at least 8 characters</span>
                                </label>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-outline btn-primary flex-1"
                                    onClick={prevStep}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                                        />
                                    </svg>
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-1"
                                    disabled={!isStep2Valid || isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="loading loading-spinner"></span>
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Create Account
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="w-5 h-5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M4.5 12.75l6 6 9-13.5"
                                                />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                {/* Sign In Link */}
                <div className="text-center mt-6">
                    <p className="text-base-content/70">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="link link-primary font-semibold">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
