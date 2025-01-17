import {useMutation} from "@tanstack/react-query";
import * as api from "../../like.ts";
import {UseMutationHook} from "../../../types/general.ts";

const useRemoveLike = ({ onSuccess, onError }: UseMutationHook) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.deleteLike,
        onSuccess,
        onError
    });

    return {
        remove: mutateAsync,
        isPending
    }
}

export default useRemoveLike;