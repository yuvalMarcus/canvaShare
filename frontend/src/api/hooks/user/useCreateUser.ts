import {useMutation} from "@tanstack/react-query";
import * as api from "../../user.ts";
import {queryClient} from "../../../main.tsx";
import {GET_USERS} from "./useGetUsers.ts";
import {toast} from "react-toastify";

const useCreateUser = () => {
    return useMutation({
        mutationFn: api.createUser,
        onSuccess: () => {},
        onError: (e) => {
            let error_msg;
            if (e?.status == 422){
                const field = e?.response?.data?.detail[0].loc[1]
                error_msg = `Invalid ${field}`;
            }
            else
                error_msg = e?.response?.data?.detail;
            toast.error(error_msg);
        },
        onSettled: async (_, error) => {
            if (!error)
                await queryClient.invalidateQueries({queryKey: [GET_USERS]})

        }
    })
}

export default useCreateUser;