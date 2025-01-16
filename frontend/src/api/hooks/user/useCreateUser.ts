import {useMutation} from "@tanstack/react-query";
import * as api from "../../user.ts";
import {queryClient} from "../../../main.tsx";
import {GET_USERS} from "./useGetUsers.ts";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";

const useCreateUser = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: api.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: [GET_USERS]});
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
        }
    })
}

export default useCreateUser;