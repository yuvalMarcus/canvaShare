import axios from "axios/index";
import instance from "../server/axios.ts";

export const getUser = async (id: number): Promise<axios.AxiosResponse> => {
    const res = await instance.get(`user/${id}`);
    return res.data;
}