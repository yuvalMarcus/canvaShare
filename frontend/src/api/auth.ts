import instance from "../server/axios";
import {LoginPayload, RegisterPayload} from "../types/auth.ts";
import axios from "axios";

export const login = async ({ username, password }: LoginPayload): Promise<axios.AxiosResponse<{ token: string }>> => {
    return await instance.post('login', {
        username,
        password
    });
}

export const register = async ({ username, email, password ,tags }: RegisterPayload): Promise<axios.AxiosResponse<void>> => {
    return await instance.post('register', {
        username,
        email,
        password,
        tags
    });
}

export const logout = async (): Promise<axios.AxiosResponse<void>> => {
    return await instance.post('logout');
}