import {useMutation} from "@tanstack/react-query";
import * as api from "../../like.ts";
import {queryClient} from "../../../main.tsx";
import {GET_LIKES} from "./useGetLikes.ts";

const useCreateLike = (canvasId: number) => {
    return useMutation({
        mutationFn: api.createLike,
        onSuccess: () => {},
        onError: () => {},
        onSettled: async (_, error) => {
            if (!error){
                await queryClient.invalidateQueries({queryKey: [GET_LIKES]})
                await queryClient.invalidateQueries({queryKey: [GET_LIKES, canvasId]})
            }
        }
    })
}

export default useCreateLike;