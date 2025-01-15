import {useMutation} from "@tanstack/react-query";
import * as api from "../../user.ts";

const useUpdateUser2 = ({ onSuccess, onError, onSettled }: { onSuccess?: () => void, onError?: () => void, onSettled?: () => void }) => {

    const { mutate } = useMutation({
        mutationFn: api.updateUser,
        onSuccess,
        onError,
        onSettled
    })

    return {
        update: (id, payload) => mutate({
            id,
            payload
        }),
    }
}

export default useUpdateUser2;