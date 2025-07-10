import { api } from '@/lib/api/baseAPI';
import {
    UpdateUserProfileRequest,
    UpdateUserProfileResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    DeleteAccountResponse
} from '@/types/user/user.types';

class UserService {
    private readonly USER_ENDPOINTS = {
        PROFILE: '/user/profile',
        RESET_PASSWORD: '/user/reset-password',
        ACCOUNT: '/user/account',
    } as const;

    /**
     * Update user profile information
     */
    async updateProfile(profileData: UpdateUserProfileRequest): Promise<UpdateUserProfileResponse> {
        try {
            const response = await api.put<UpdateUserProfileResponse>(
                this.USER_ENDPOINTS.PROFILE,
                profileData
            );
            return response;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }

    /**
     * Reset user password
     */
    async resetPassword(passwordData: ResetPasswordRequest): Promise<ResetPasswordResponse> {
        try {
            const response = await api.post<ResetPasswordResponse>(
                this.USER_ENDPOINTS.RESET_PASSWORD,
                passwordData
            );
            return response;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }

    /**
     * Delete user account and all related data
     */
    async deleteAccount(): Promise<DeleteAccountResponse> {
        try {
            const response = await api.delete<DeleteAccountResponse>(
                this.USER_ENDPOINTS.ACCOUNT
            );
            return response;
        } catch (error) {
            console.error('Delete account error:', error);
            throw error;
        }
    }
}

export const userService = new UserService();