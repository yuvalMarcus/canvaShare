import {useMutation} from "@tanstack/react-query";
import * as api from "../../report.ts";
import {queryClient} from "../../../main.tsx";
import {GET_REPORTS} from "./useGetReports.ts";
import {toast} from "react-toastify";

const useCreateReport = () => {
    return useMutation({
        mutationFn: api.createReport,
        onSuccess: () => {toast.success("Reported");},
        onError: () => {toast.error("Report failed");},
        onSettled: async (_, error) => {
            if (!error)
                await queryClient.invalidateQueries({queryKey: [GET_REPORTS]})
        }
    })
}

export default useCreateReport;