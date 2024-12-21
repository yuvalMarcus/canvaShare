import axios from "axios";
import instance from "../server/axios.ts";
import {CanvasPayload} from "../types/canvas.ts";

export const searchPhotos = async (params: Record<string, string>): Promise<axios.AxiosResponse> => {
    const { data } = await instance.get('photo', {
        params
    });

    return data;
}

export const getPainter = async (id: number): Promise<axios.AxiosResponse> => {
    const res = await instance.get(`canvas/${id}`);
    return res.data;
}

export const getPainters = async (params): Promise<axios.AxiosResponse> => {
    const res = await instance.get('canvas', {
        params
    });
    return res.data;
}

export const createPainter = async (payload: CanvasPayload): Promise<axios.AxiosResponse> => {
    return await instance.post('canvas', payload);
}


export const deletePainter = async (id: number): Promise<axios.AxiosResponse> => {
     await instance.delete(`canvas/${id}`);
}