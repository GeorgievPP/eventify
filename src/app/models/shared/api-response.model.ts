export interface ApiError {
    message: string;
    code: string | null;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    error?: ApiError | null;
}