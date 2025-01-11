import {useMutation} from "@tanstack/react-query";
import * as api from "../../user.ts";
import {queryClient} from "../../../main.tsx";

const useDeleteUser = () => {
    return useMutation({
        mutationFn: (id: number) => api.deleteUser(id),
        onSuccess: () => {},
        onSettled: async (_, error) => {
            if (error)
                console.log(error)
            else
                await queryClient.invalidateQueries({queryKey: ['getUsers']})
        }
    })
}

export default useDeleteUser;