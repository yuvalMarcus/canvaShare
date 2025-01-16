import {useMutation} from "@tanstack/react-query";
import * as api from "../../paint.ts";

const useCreatePaint = ({ onSuccess, onError, onSettled }: { onSuccess?: () => void, onError?: (error: Error) => void, onSettled?: () => void }) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.createPaint,
        onSuccess,
        onError,
        onSettled
    });

    return {
        create: mutateAsync,
        isPending,
    }
}

export default useCreatePaint;