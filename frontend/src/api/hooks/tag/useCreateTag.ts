import {useMutation} from "@tanstack/react-query";
import * as api from "../../tags.ts";
import {queryClient} from "../../../main.tsx";
import {GET_TAGS} from "./useGetTags.ts";
import {toast} from "react-toastify";

const useCreateTag =
    (handleUpload, payload, getValues ,setValue) => {
    return useMutation({
        mutationFn: api.createTag,
        onSuccess: () => {
            handleUpload('tags', [...(payload?.tags ?? []), getValues('name')]);
            setValue('name', '');
            queryClient.invalidateQueries({ queryKey: [GET_TAGS] });
        },
        onError: (e) => {
            let error_msg;
            if (e?.status == 422)
                error_msg = "Invalid tag";
            else
                error_msg = e?.response?.data?.detail;
            toast.error(error_msg);
        },
        onSettled: async (_, error) => {
            if (!error)
                await queryClient.invalidateQueries({queryKey: [GET_TAGS]})
        }
    })
}

export default useCreateTag;