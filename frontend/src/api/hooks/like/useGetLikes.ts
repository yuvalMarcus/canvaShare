import {useQuery} from "@tanstack/react-query";
import * as likeApi from "../../like.ts";

export const GET_LIKES = 'getLikes';

const useGetLikes = (canvasId: number, userId: number | null) => {
    const { data, isPending } = useQuery({
        queryKey: [GET_LIKES, canvasId],
        queryFn: () => {
            console.log(canvasId, userId)
            if (canvasId && userId)
                return likeApi.getLikes({canvas_id: canvasId, user_id: userId})
            return likeApi.getLikes({canvas_id: canvasId})
        }
    });

    return {
        data,
        isPending
    }
}

export default useGetLikes;