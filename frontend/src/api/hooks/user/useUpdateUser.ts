import {useMutation} from "@tanstack/react-query";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";
import * as api from "../../user.ts";
import {queryClient} from "../../../main.tsx";
import {GET_USERS} from "./useGetUsers.ts";
import {GET_USER} from "./useGetUser.ts";

const useUpdateUser = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: api.updateUser,
        onSuccess: () => {
            navigate(0);
            },
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
            if (!error){
                await queryClient.invalidateQueries({queryKey: [GET_USERS]})
                await queryClient.invalidateQueries({ queryKey: [GET_USER] });
                //await queryClient.invalidateQueries({ queryKey: [GET_PAINT] });
            }
        }
    })
}

export default useUpdateUser;