import {useMutation} from "@tanstack/react-query";
import * as api from "../../like.ts";
import {UseMutationHook} from "../../../types/general.ts";

const useCreateLike = ({ onSuccess, onError }: UseMutationHook) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.createLike,
        onSuccess,
        onError
    });

    return {
        create: mutateAsync,
        isPending,
    }
}

export default useCreateLike;