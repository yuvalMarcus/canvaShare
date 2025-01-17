import {useMutation} from "@tanstack/react-query";
import * as api from "../../auth.ts";
import {UseMutationHook} from "../../../types/general.ts";

const useRegister = ({ onSuccess, onError }: UseMutationHook) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.register,
        onSuccess,
        onError
    })

    return {
        register: mutateAsync,
        isPending,
    }
}

export default useRegister;
