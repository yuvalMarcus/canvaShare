import {useMutation} from "@tanstack/react-query";
import * as api from "../../like.ts";

const useCreateLike = ({ onSuccess, onError, onSettled }: { onSuccess?: () => void, onError?: () => void, onSettled?: () => void }) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.createLike,
        onSuccess,
        onError,
        onSettled
    });

    return {
        create: mutateAsync,
        isPending,
    }
}

export default useCreateLike;