import {useMutation, useQueryClient} from "@tanstack/react-query";
import * as api from "../../api/yarin.ts";

const useDeleteUser = () => {
    const queryClient = useQueryClient();
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