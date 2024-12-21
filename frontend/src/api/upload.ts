import axios from "axios/index";
import instance from "../server/axios.ts";
import {uploadPayload} from "../types/upload.ts";

export const uploadPhoto = async (payload: uploadPayload): Promise<axios.AxiosResponse> => {
    return await instance.post('photo', payload, {
        params: {
            save_to: 'canvas'
        }
    });
}
