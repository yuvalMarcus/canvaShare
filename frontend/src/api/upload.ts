import axios from "axios/index";
import instance from "../server/axios.ts";
import {uploadPayload} from "../types/upload.ts";

export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return await instance.post('photo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        params: {
            save_to: 'canvas'
        }
    });
}
