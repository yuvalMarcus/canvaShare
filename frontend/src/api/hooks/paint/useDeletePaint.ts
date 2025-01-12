import {useMutation} from "@tanstack/react-query";
import * as api from "../../paint.ts";
import {queryClient} from "../../../main.tsx";
import {GET_PAINTS} from "./useGetPaints.ts";

const useDeletePaint = () => {
    return useMutation({
        mutationFn: (id: number) => api.deletePaint(id),
        onSuccess: () => {},
        onSettled: async (_, error) => {
            if (!error)
                await queryClient.invalidateQueries({queryKey: [GET_PAINTS]})
        }
    })
}

export default useDeletePaint;