import {useMutation} from "@tanstack/react-query";
import * as api from "../../auth.ts";
import {UseMutationHook} from "../../../types/general.ts";

const useRefreshToken = ({ onSuccess, onError }: UseMutationHook) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.refreshToken,
        onSuccess,
        onError,
    });

    return {
        refresh: mutateAsync,
        isPending,
    }
}

export default useRefreshToken;