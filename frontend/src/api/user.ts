import {AxiosResponse} from "axios";
import instance from "../server/axios.ts";
import {UserPayload, UserResponse} from "../types/user.ts";

export const getUsers = async (params): Promise<AxiosResponse> => {
    const response = await instance.get('user', {params});
    return response.data;
}

export const getUser = async (id: number | null, onError?: () => void): Promise<UserResponse> => {
    try {
        const response = await instance.get(`user/${id}`);
        return response.data;
    } catch (e) {
        onError?.();
    }
}

export const createUser = async (payload: UserPayload): Promise<AxiosResponse> => {
    return await instance.post('user', payload);
}

export const updateUser = async ({ id, payload }: { id: number, payload: UserPayload }): Promise<AxiosResponse> => {
    const response = await instance.put(`user/${id}`, payload);
    return response.data;
}

export const deleteUser = async (id: number) =>{
    await instance.delete(`user/${id}`);
}