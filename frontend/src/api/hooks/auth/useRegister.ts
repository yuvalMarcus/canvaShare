import {useMutation} from "@tanstack/react-query";
import * as api from "../../auth.ts";

const useRegister = ({ onSuccess, onError, onSettled }: { onSuccess?: () => void, onError?: (error: Error) => void, onSettled?: () => void }) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.register,
        onSuccess,
        onError,
        onSettled
    })

    return {
        register: mutateAsync,
        isPending,
    }
}

export default useRegister;
