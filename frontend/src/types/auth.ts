
export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    tags: string[];
}

export interface LoginPayload {
    username: string;
    password: string;
}

export interface RefreshTokenPayload {
    refreshToken: string;
}