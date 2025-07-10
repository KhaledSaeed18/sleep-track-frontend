// User profile update request
export interface UpdateUserProfileRequest {
    first_name: string;
    last_name: string;
    date_of_birth: string; // ISO 8601 date string
}

// User profile response (reuse User from auth.types)
export type UpdateUserProfileResponse = import('@/types/auth/auth.types').User;

// Password reset request
export interface ResetPasswordRequest {
    old_password: string;
    new_password: string;
}

// Password reset response (can be empty or a message)
export interface ResetPasswordResponse {
    message?: string;
}

// Delete account response (can be empty or a message)
export interface DeleteAccountResponse {
    message?: string;
}
