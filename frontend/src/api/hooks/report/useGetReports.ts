import {useQuery} from "@tanstack/react-query";
import * as reportApi from "../../report.ts";

export const GET_REPORTS = 'getReports';

const useGetReports = () => {
    const { data, isPending } = useQuery({
        queryKey: [GET_REPORTS],
        queryFn: () => reportApi.getReports(),
        retry: false,
    });

    return {
        data,
        isPending
    }
}

export default useGetReports;