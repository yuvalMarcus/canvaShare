import {AxiosResponse} from "axios";
import instance from "../server/axios.ts";
import {UserPayload} from "../types/user.ts";
import Axios from "../server/axios.ts";

export const getUsers = async (params): Promise<AxiosResponse> => {
    const res = await instance.get('user', {params});
    return res.data;
}

export const getUser = async (id?: number | string, onError?: () => void): Promise<AxiosResponse> => {
    try {
        const res = await instance.get(`user/${id}`);
        return res.data;
    } catch (e) {
        onError?.();
        return new Promise(new Axios({}));
    }
}

export const createUser = async (payload: UserPayload): Promise<AxiosResponse> => {
    return await instance.post('user', payload);
}

export const updateUser = async ({ id, payload }: { id: number, payload: UserPayload }): Promise<AxiosResponse> => {
    const res = await instance.put(`user/${id}`, payload);
    return res.data;
}

export const deleteUser = async (id: number) =>{
    await instance.delete(`user/${id}`);
}