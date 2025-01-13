import {ReportPayload} from "../types/report.ts";
import axios from "axios";
import instance from "../server/axios.ts";

export const createReport = async (payload: ReportPayload): Promise<axios.AxiosResponse> => {
    return await instance.post('report', payload);
}

export const getReports = async (): Promise<axios.AxiosResponse> => {
    const res = await instance.get('report');
    return res.data;
}
export const deleteReport = async (id: number) =>{
    await instance.delete(`report/${id}`);
}