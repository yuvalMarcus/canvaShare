import {ReportPayload} from "../types/report.ts";
import {AxiosResponse} from "axios";
import instance from "../server/axios.ts";

export const createReport = async (payload: ReportPayload): Promise<AxiosResponse> => {
    return await instance.post('report', payload);
}

export const getReports = async (): Promise<AxiosResponse> => {
    const res = await instance.get('report');
    return res.data;
}
export const deleteReport = async (id: number) =>{
    await instance.delete(`report/${id}`);
}