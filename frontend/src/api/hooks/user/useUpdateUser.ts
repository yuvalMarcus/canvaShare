import {useMutation} from "@tanstack/react-query";
import * as api from "../../user.ts";
import {UseMutationHook} from "../../../types/general.ts";

const useUpdateUser = ({ onSuccess, onError }: UseMutationHook) => {

    const { mutateAsync } = useMutation({
        mutationFn: api.updateUser,
        onSuccess,
        onError
    })

    return {
        update: mutateAsync,
    }
}

export default useUpdateUser;