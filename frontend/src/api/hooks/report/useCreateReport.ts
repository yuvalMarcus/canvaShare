import {useMutation} from "@tanstack/react-query";
import * as api from "../../report.ts";
import {UseMutationHook} from "../../../types/general.ts";

const useCreateReport = ({ onSuccess, onError, onSettled }: UseMutationHook) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.createReport,
        onSuccess,
        onError,
        onSettled
    });

    return {
        create: mutateAsync,
        isPending,
    }
}

export default useCreateReport;