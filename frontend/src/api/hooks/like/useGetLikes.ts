import {useQuery} from "@tanstack/react-query";
import * as api from "../../like.ts";

interface UseGetLikesParams {
    paintId: number;
    userId?: number;
}

export const GET_LIKES = 'getLikes';

const useGetLikes = (params : UseGetLikesParams) => {

    const { data, isPending } = useQuery({
        queryKey: [GET_LIKES, params],
        queryFn: () => api.getLikes({ paintId: params.paintId, userId: params.userId }),
    });

    return {
        data,
        isPending
    }
}

export default useGetLikes;