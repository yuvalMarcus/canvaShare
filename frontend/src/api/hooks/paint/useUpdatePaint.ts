import {useMutation} from "@tanstack/react-query";
import * as api from "../../paint.ts";

const useUpdatePaint = ({ onSuccess, onError, onSettled }: { onSuccess?: () => void, onError?: (error: Error) => void, onSettled?: () => void }) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: ({ id, payload }) => api.updatePaint(Number(id), payload),
        onSuccess,
        onError,
        onSettled
    })


    return {
        update: mutateAsync,
        isPending
    }
}

export default useUpdatePaint;