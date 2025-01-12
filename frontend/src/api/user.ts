import axios from "axios";
import instance from "../server/axios.ts";
import {UserPayload} from "../types/user.ts";

export const getUsers = async (): Promise<axios.AxiosResponse> => {
    const res = await instance.get('user');
    return res.data;
}

export const getUser = async (id?: number | string): Promise<axios.AxiosResponse> => {
    const res = await instance.get(`user/${id}`);
    return res.data;
}

export const createUser = async (payload: UserPayload): Promise<axios.AxiosResponse> => {
    return await instance.post('user', payload);
}

export const updateUser = async ({ id, payload }: {id: number, payload: UserPayload}): Promise<axios.AxiosResponse> => {
    const res = await instance.put(`user/${id}`, payload);
    return res.data;
}

export const deleteUser = async (id: number) =>{
    await instance.delete(`user/${id}`);
}