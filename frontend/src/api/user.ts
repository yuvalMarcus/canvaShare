import axios from "axios/index";
import instance from "../server/axios.ts";
import {CanvasPayload} from "../types/canvas.ts";

export const getUsers = async (): Promise<axios.AxiosResponse> => {
    const res = await instance.get(`user`);
    return res.data;
}

export const getUser = async (id?: number | string): Promise<axios.AxiosResponse> => {
    const res = await instance.get(`user/${id}`);
    return res.data;
}

export const updateUser = async ({ id, payload }: {id: number, payload: any}): Promise<axios.AxiosResponse> => {
    const res = await instance.put(`user/${id}`, payload);
    return res.data;
}