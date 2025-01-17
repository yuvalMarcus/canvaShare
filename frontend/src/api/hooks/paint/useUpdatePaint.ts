import {useMutation} from "@tanstack/react-query";
import * as api from "../../paint.ts";
import {UseMutationHook} from "../../../types/general.ts";

const useUpdatePaint = ({ onSuccess, onError }: UseMutationHook) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: ({ id, payload }) => api.updatePaint(Number(id), payload),
        onSuccess,
        onError
    })


    return {
        update: mutateAsync,
        isPending
    }
}

export default useUpdatePaint;