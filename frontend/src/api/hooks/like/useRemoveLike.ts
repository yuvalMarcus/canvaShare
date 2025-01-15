import {useMutation} from "@tanstack/react-query";
import * as api from "../../like.ts";

const useRemoveLike = ({ onSuccess, onError, onSettled }: { onSuccess?: () => void, onError?: () => void, onSettled?: () => void }) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.deleteLike,
        onSuccess,
        onError,
        onSettled
    });

    return {
        remove: mutateAsync,
        isPending
    }
}

export default useRemoveLike;