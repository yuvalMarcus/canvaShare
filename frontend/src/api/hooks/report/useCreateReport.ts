import {useMutation} from "@tanstack/react-query";
import * as api from "../../report.ts";

const useCreateReport = ({ onSuccess, onError, onSettled }: { onSuccess?: () => void, onError?: (error: Error) => void, onSettled?: () => void }) => {

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