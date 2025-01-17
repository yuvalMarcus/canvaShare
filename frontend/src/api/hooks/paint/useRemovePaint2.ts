import {useMutation} from "@tanstack/react-query";
import * as api from "../../paint.ts";
import {UseMutationHook} from "../../../types/general.ts";

const useRemovePaint2 = ({ onSuccess, onError }: UseMutationHook) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.deletePaint,
        onSuccess,
        onError
    });

    return {
        remove: mutateAsync,
        isPending
    }
}

export default useRemovePaint2;