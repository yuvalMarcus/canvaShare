import {useMutation} from "@tanstack/react-query";
import * as api from "../../tags.ts";
import {UseMutationHook} from "../../../types/general.ts";

const useRemoveTag = ({ onSuccess, onError }: UseMutationHook) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.deleteTag,
        onSuccess,
        onError
    });

    return {
        remove: mutateAsync,
        isPending
    }
}

export default useRemoveTag;