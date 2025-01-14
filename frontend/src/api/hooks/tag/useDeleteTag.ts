import {useMutation} from "@tanstack/react-query";
import * as api from "../../tags.ts";
import {queryClient} from "../../../main.tsx";
import {GET_TAGS} from "./useGetTags.ts";
import {GET_PAINTS} from "../paint/useGetPaints.ts";
import {toast} from "react-toastify";

const useDeleteTag = () => {
    return useMutation({
        mutationFn: (id: number) => api.deleteTag(id),
        onSuccess: () => {},
        onError: () => {toast.error("Delete failed");},
        onSettled: async (_, error) => {
            if (!error){
                await queryClient.invalidateQueries({queryKey: [GET_TAGS]})
                await queryClient.invalidateQueries({queryKey: [GET_PAINTS]})
            }
        }
    })
}

export default useDeleteTag;