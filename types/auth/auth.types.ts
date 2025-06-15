// Request types
export interface SignupRequest {
    email: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

// User type
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    created_at: string;
}

// Response types
export interface SignupResponse {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    created_at: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}

// Error types
export interface ValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
}

export interface ValidationErrorResponse {
    detail: ValidationError[];
}

// Store types
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface AuthActions {
    login: (credentials: LoginRequest) => Promise<void>;
    signup: (userData: SignupRequest) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
}