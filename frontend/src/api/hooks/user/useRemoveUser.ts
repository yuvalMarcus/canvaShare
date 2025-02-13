import {useMutation} from "@tanstack/react-query";
import * as api from "../../user.ts";
import {UseMutationHook} from "../../../types/general.ts";

const useRemoveUser = ({ onSuccess, onError }: UseMutationHook) => {
    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.deleteUser,
        onSuccess,
        onError
    })

    return {
        remove: mutateAsync,
        isPending
    }
}

export default useRemoveUser;