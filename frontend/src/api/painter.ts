import axios from "axios";
import instance from "../server/axios.ts";
import {CanvasPayload} from "../types/canvas.ts";

export const searchPhotos = async (params: Record<string, string>): Promise<axios.AxiosResponse> => {
    const { data } = await instance.get('photo', {
        params
    });

    return data;
}

export const createPainter = async (payload: CanvasPayload): Promise<axios.AxiosResponse> => {
    return await instance.post('canvas', payload);
}
