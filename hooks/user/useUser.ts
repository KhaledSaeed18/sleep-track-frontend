import { useState, useCallback } from 'react';
import { userService } from '@/services/user/user.service';
import {
    UpdateUserProfileRequest,
    UpdateUserProfileResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    DeleteAccountResponse
} from '@/types/user/user.types';

// Update User Profile
export function useUpdateUserProfile() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<UpdateUserProfileResponse | null>(null);

    const updateProfile = useCallback(async (profileData: UpdateUserProfileRequest) => {
        setLoading(true);
        setError(null);
        try {
            const result = await userService.updateProfile(profileData);
            setData(result);
            return result;
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { updateProfile, loading, error, data };
}

// Reset Password
export function useResetPassword() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ResetPasswordResponse | null>(null);

    const resetPassword = useCallback(async (passwordData: ResetPasswordRequest) => {
        setLoading(true);
        setError(null);
        try {
            const result = await userService.resetPassword(passwordData);
            setData(result);
            return result;
        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { resetPassword, loading, error, data };
}

// Delete Account
export function useDeleteAccount() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<DeleteAccountResponse | null>(null);

    const deleteAccount = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await userService.deleteAccount();
            setData(result);
            return result;
        } catch (err: any) {
            setError(err.message || 'Failed to delete account');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { deleteAccount, loading, error, data };
}
