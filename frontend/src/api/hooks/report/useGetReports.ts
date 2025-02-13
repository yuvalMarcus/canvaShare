import {useQuery} from "@tanstack/react-query";
import * as api from "../../report.ts";

export const GET_REPORTS = 'getReports';

const useGetReports = () => {

    const { data, isPending } = useQuery({
        queryKey: [GET_REPORTS],
        queryFn: () => api.getReports(),
        retry: false,
    });

    return {
        data,
        isPending
    }
}

export default useGetReports;