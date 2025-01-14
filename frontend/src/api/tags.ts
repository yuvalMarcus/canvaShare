import axios from "axios";
import instance from "../server/axios.ts";
import {TagPayload} from "../types/tags.ts";

export const getTags = async (): Promise<axios.AxiosResponse> => {
    const res = await instance.get('tag');
    return res.data;
}

export const createTag = async (payload: TagPayload): Promise<axios.AxiosResponse> => {
    return await instance.post('tag', payload);
}

export const deleteTag = async (id: number) =>{
    await instance.delete(`tag/${id}`);
}