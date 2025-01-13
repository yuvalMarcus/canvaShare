import {useMutation} from "@tanstack/react-query";
import * as api from "../../report.ts";
import {queryClient} from "../../../main.tsx";
import {GET_REPORTS} from "./useGetReports.ts";

const useDeleteReport = () => {
    return useMutation({
        mutationFn: (id: number) => api.deleteReport(id),
        onSuccess: () => {},
        onSettled: async (_, error) => {
            if (!error)
                await queryClient.invalidateQueries({queryKey: [GET_REPORTS]})
        }
    })
}

export default useDeleteReport;