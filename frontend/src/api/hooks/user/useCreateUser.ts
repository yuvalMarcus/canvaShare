import {useMutation} from "@tanstack/react-query";
import * as api from "../../user.ts";
import {UseMutationHook} from "../../../types/general.ts";

const useCreateUser = ({ onSuccess, onError }: UseMutationHook) => {

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.createUser,
        onSuccess: onSuccess,
        onError: onError
    })

    return {
        create: mutateAsync,
        isPending,
    }
}

export default useCreateUser;