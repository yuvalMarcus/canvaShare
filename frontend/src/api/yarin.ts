import axios from "axios";
import instance from "../server/axios.ts";

export const getUsers = async (): Promise<axios.AxiosResponse> => {
    const res = await instance.get(`user`);
    return res.data;
}
