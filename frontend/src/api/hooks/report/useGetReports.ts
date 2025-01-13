import {useQuery} from "@tanstack/react-query";
import * as reportApi from "../../report.ts";

export const GET_REPORTS = 'getReports';

const useGetReports = () => {
    const { data, isPending, isError } = useQuery({
        queryKey: [GET_REPORTS],
        queryFn: () => reportApi.getReports(),
    });

    return {
        data,
        isPending,
        isError
    }
}

export default useGetReports;