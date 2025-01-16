export interface userTable {
    id: number;
    username: string;
    email: string;
    isBlocked: boolean;
    profilePhoto: string;
    coverPhoto: string;
    password: string;
}

export interface UserPayload {
    username?: string;
    email?: string;
    password?: string;
    isBlocked?: boolean;
    tags?: string[];
    about?: string;
    profilePhoto?: string;
    coverPhoto?: string;
    roles?: string[];
}