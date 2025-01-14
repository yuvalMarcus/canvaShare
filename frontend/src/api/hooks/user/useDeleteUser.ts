import {useMutation} from "@tanstack/react-query";
import * as api from "../../user.ts";
import {queryClient} from "../../../main.tsx";
import {GET_USERS} from "./useGetUsers.ts";
import {toast} from "react-toastify";

const useDeleteUser = () => {
    return useMutation({
        mutationFn: (id: number) => api.deleteUser(id),
        onSuccess: () => {},
        onError: () => {toast.error("Delete failed");},
        onSettled: async (_, error) => {
            if (!error)
                await queryClient.invalidateQueries({queryKey: [GET_USERS]})
        }
    })
}

export default useDeleteUser;