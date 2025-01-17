import {useMutation} from "@tanstack/react-query";
import * as api from "../../auth.ts";
import {UseMutationHook} from "../../../types/general.ts";

const useLogin = ({ onSuccess, onError }: UseMutationHook) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.login,
        onSuccess,
        onError
    });

    return {
        login: mutateAsync,
        isPending,
    }
}

export default useLogin;