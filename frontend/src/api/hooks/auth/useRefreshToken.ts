import {useMutation} from "@tanstack/react-query";
import * as api from "../../auth.ts";

const useRefreshToken = () => {
    return useMutation({
        mutationFn: api.refreshToken,
        onSuccess: () => {},
        onError: () => {},
    })
}

export default useRefreshToken;