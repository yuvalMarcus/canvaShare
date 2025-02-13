export interface UserResponse {
    about: string;
    coverPhoto: string | null;
    email: string;
    id: number;
    isBlocked: boolean;
    password: string | null;
    profilePhoto: string | null;
    roles: string[];
    tags: string[];
    username: string;
}

export interface userTable {
    id: number;
    username: string;
    email: string;
    isBlocked: boolean;
    profilePhoto: string;
    coverPhoto: string;
    roles?: string[];
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    tags: string[];
}

export interface UserPayload {
    username?: string;
    email?: string;
    password?: string;
    profilePhoto?: string;
    coverPhoto?: string;
    isBlocked?: boolean;
    tags?: string[];
    about?: string;
    roles?: string[];
}