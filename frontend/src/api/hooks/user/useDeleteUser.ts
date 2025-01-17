import {useMutation} from "@tanstack/react-query";
import * as api from "../../user.ts";
import {queryClient} from "../../../main.tsx";
import {GET_USERS} from "./useGetUsers.ts";
import {toast} from "react-toastify";

const useDeleteUser = () => {
    return useMutation({
        mutationFn: (id: number) => api.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: [GET_USERS]})
        },
        onError: () => {toast.error("Delete failed");}
    })
}

export default useDeleteUser;