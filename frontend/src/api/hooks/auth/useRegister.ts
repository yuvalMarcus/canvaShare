import {useMutation} from "@tanstack/react-query";
import * as api from "../../auth.ts";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";

const useRegister = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: api.register,
        onSuccess: () => {
            toast.success('Register successfully');
            navigate("/login");
            },
        onError: (e) => {
            let error_msg;
            if (e?.status == 422){
                const field = e?.response?.data?.detail[0].loc[1]
                error_msg = `Invalid ${field}`;
            }
            else
                error_msg = e?.response?.data?.detail;
            toast.error(error_msg, {autoClose: 4000});
        },
    })
}

export default useRegister;