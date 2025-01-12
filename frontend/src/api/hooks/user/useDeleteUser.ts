import {useMutation} from "@tanstack/react-query";
import * as api from "../../user.ts";
import {queryClient} from "../../../main.tsx";
import {GET_USERS} from "./useGetUsers.ts";

const useDeleteUser = () => {
    return useMutation({
        mutationFn: (id: number) => api.deleteUser(id),
        onSuccess: () => {},
        onSettled: async (_, error) => {
            if (!error)
                await queryClient.invalidateQueries({queryKey: [GET_USERS]})
        }
    })
}

export default useDeleteUser;