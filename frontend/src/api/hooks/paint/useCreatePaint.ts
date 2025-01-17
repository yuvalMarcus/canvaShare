import {useMutation} from "@tanstack/react-query";
import * as api from "../../paint.ts";
import {UseMutationHook} from "../../../types/general.ts";

const useCreatePaint = ({ onSuccess, onError }: UseMutationHook) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.createPaint,
        onSuccess,
        onError
    });

    return {
        create: mutateAsync,
        isPending,
    }
}

export default useCreatePaint;