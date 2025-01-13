export interface userTable {
    id: number;
    username: string;
    email: string;
    profilePhoto: string;
    coverPhoto: string;
    password: string;
}

export interface UserPayload {
    username: string;
    email: string;
    password?: string;
    tags?: string[];
    about?: string;
    roles?: string[];
}