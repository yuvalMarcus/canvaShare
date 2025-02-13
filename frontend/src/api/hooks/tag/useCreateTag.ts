import {useMutation} from "@tanstack/react-query";
import * as api from "../../tags.ts";
import {UseMutationHook} from "../../../types/general.ts";

const useCreateTag = ({ onSuccess, onError }: UseMutationHook) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.createTag,
        onSuccess,
        onError
    });

    return {
        create: mutateAsync,
        isPending,
    }
}

export default useCreateTag;