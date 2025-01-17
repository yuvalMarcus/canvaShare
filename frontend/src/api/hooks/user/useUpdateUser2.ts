import {useMutation} from "@tanstack/react-query";
import * as api from "../../user.ts";
import {UseMutationHook} from "../../../types/general.ts";

const useUpdateUser2 = ({ onSuccess, onError }: UseMutationHook) => {

    const { mutate } = useMutation({
        mutationFn: api.updateUser,
        onSuccess,
        onError
    })

    return {
        update: mutate,
    }
}

export default useUpdateUser2;