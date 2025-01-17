import {AxiosResponse} from "axios";
import instance from "../server/axios.ts";
import {TagPayload} from "../types/tags.ts";

export const getTags = async (): Promise<AxiosResponse> => {
    const res = await instance.get('tag');
    return res.data;
}

export const createTag = async (payload: TagPayload): Promise<AxiosResponse> => {
    return await instance.post('tag', payload);
}

export const deleteTag = async (id: number) =>{
    await instance.delete(`tag/${id}`);
}