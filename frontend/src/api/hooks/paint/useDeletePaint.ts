import {useMutation} from "@tanstack/react-query";
import * as api from "../../paint.ts";
import {queryClient} from "../../../main.tsx";
import {GET_PAINTS} from "./useGetPaints.ts";
import {GET_PAINT} from "./useGetPaint.ts"
import {toast} from "react-toastify";

const useDeletePaint = (id?: number) => {
    return useMutation({
        mutationFn: (id: number) => api.deletePaint(id),
        onSuccess: () => {},
        onError: () => {toast.error("Delete failed");},
        onSettled: async (_, error) => {
            if (!error){
                await queryClient.invalidateQueries({queryKey: [GET_PAINTS]})
                await queryClient.invalidateQueries({queryKey: [GET_PAINT, id]})
            }
        }
    })
}

export default useDeletePaint;