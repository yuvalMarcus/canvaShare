import {useMutation} from "@tanstack/react-query";
import * as api from "../../auth.ts";

const useLogin = ({ onSuccess, onError, onSettled }: { onSuccess?: () => void, onError?: (error: Error) => void, onSettled?: () => void }) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.login,
        onSuccess,
        onError,
        onSettled
    });

    return {
        login: mutateAsync,
        isPending,
    }
}

export default useLogin;