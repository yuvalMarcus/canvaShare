import {useMutation} from "@tanstack/react-query";
import * as api from "../../report.ts";
import {queryClient} from "../../../main.tsx";
import {GET_REPORTS} from "./useGetReports.ts";
import {toast} from "react-toastify";

const useDeleteReport = () => {
    return useMutation({
        mutationFn: (id: number) => api.deleteReport(id),
        onSuccess: () => {},
        onError: () => {toast.error("Delete failed");},
        onSettled: async (_, error) => {
            if (!error)
                await queryClient.invalidateQueries({queryKey: [GET_REPORTS]})
        }
    })
}

export default useDeleteReport;