import {useMutation} from "@tanstack/react-query";
import * as api from "../../user.ts";
import {queryClient} from "../../../main.tsx";
import {GET_USERS} from "./useGetUsers.ts";

const useCreateUser = () => {
    return useMutation({
        mutationFn: api.createUser,
        onSuccess: () => {},
        onError: () => {},
        onSettled: async (_, error) => {
            if (!error)
                await queryClient.invalidateQueries({queryKey: [GET_USERS]})
        }
    })
}

export default useCreateUser;