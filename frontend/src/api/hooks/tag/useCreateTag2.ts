import {useMutation} from "@tanstack/react-query";
import * as api from "../../tags.ts";
const useCreateTag2 = ({ onSuccess, onError, onSettled }: { onSuccess?: () => void, onError?: (error: Error) => void, onSettled?: () => void }) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.createTag,
        onSuccess,
        onError,
        onSettled
    });

    return {
        create: mutateAsync,
        isPending,
    }
}

export default useCreateTag2;