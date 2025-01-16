export interface userTable {
    id: number;
    username: string;
    email: string;
    isBlocked: boolean;
    profilePhoto: string;
    coverPhoto: string;
    password: string;
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