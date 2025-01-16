import {useMutation} from "@tanstack/react-query";
import * as api from "../../user.ts";

const useUpdateUser2 = ({ onSuccess, onError, onSettled }: { onSuccess?: () => void, onError?: (error: Error) => void, onSettled?: () => void }) => {

    const { mutate } = useMutation({
        mutationFn: api.updateUser,
        onSuccess,
        onError,
        onSettled
    })

    return {
        update: mutate,
    }
}

export default useUpdateUser2;