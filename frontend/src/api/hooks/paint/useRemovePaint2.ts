import {useMutation} from "@tanstack/react-query";
import * as api from "../../paint.ts";

const useRemovePaint2 = ({ onSuccess, onError, onSettled }: { onSuccess?: () => void, onError?: () => void, onSettled?: () => void }) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.deletePaint,
        onSuccess,
        onError,
        onSettled
    });

    return {
        remove: mutateAsync,
        isPending
    }
}

export default useRemovePaint2;