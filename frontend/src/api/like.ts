import {AxiosResponse} from "axios";
import instance from "../server/axios.ts";
import {LikePayload} from "../types/like.ts";

export const getLikes = async (params): Promise<AxiosResponse> => {
    const res = await instance.get('like', {
        params
    });
    return res.data;
}
export const createLike = async (payload: LikePayload): Promise<AxiosResponse> => {
    return await instance.post('like', payload);
}

export const deleteLike = async (id: number): Promise<AxiosResponse> => {
    return await instance.delete(`like/${id}`);
}

