import {useMutation} from "@tanstack/react-query";
import * as api from "../../report.ts";
import {UseMutationHook} from "../../../types/general.ts";

const useRemoveReport = ({ onSuccess, onError }: UseMutationHook) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.deleteReport,
        onSuccess,
        onError,
    })


    return {
        remove: mutateAsync,
        isPending
    }
}

export default useRemoveReport;