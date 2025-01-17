import instance from "../server/axios";
import {LoginPayload, RefreshTokenPayload} from "../types/auth.ts";
import {RegisterPayload} from "../types/auth.ts";
import {AxiosResponse} from "axios";

export const login = async ({ username, password }: LoginPayload): Promise<AxiosResponse<{ token: string }>> => {
    return await instance.post('login', {
        username,
        password
    });
}

export const refreshToken = async ({ refreshToken }: RefreshTokenPayload): Promise<AxiosResponse<{ token: string }>> => {
    return await instance.post('refreshToken', {
        token: refreshToken,
    });
}

export const register = async ({ username, email, password ,tags }: RegisterPayload): Promise<AxiosResponse<void>> => {
    return await instance.post('register', {
        username,
        email,
        password,
        tags
    });
}

export const logout = async (): Promise<AxiosResponse<void>> => {
    return await instance.post('logout');
}