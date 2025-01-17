import {AxiosResponse} from "axios";
import instance from "../server/axios.ts";
import {PaintPayload} from "../types/paint.ts";

export const searchPhotos = async (params: Record<string, string>): Promise<AxiosResponse> => {
    const { data } = await instance.get('photo', {
        params
    });

    return data;
}

export const getPaint = async (id?: number): Promise<AxiosResponse> => {
    const res = await instance.get(`paint/${id}`);
    return res.data;
}

export const getPaints = async (params): Promise<AxiosResponse> => {
    const res = await instance.get('paint', {
        params
    });
    return res.data;
}

export const createPaint = async (payload: PaintPayload): Promise<AxiosResponse> => {
    return await instance.post('paint', payload);
}

export const updatePaint = async (id: number, payload: PaintPayload): Promise<AxiosResponse> => {
    return await instance.put(`paint/${id}`, payload);
}

export const deletePaint = async (id: number) => {
     await instance.delete(`paint/${id}`);
}