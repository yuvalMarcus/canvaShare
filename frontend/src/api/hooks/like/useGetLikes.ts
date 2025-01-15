import {useQuery} from "@tanstack/react-query";
import * as api from "../../like.ts";

export const GET_LIKES = 'getLikes';

const useGetLikes = (paintId: number, userId: number) => {

    const { data, isPending } = useQuery({
        queryKey: [GET_LIKES, paintId, userId],
        queryFn: () => api.getLikes({ canvasId: paintId }),
    });

    return {
        data,
        isPending
    }
}

export default useGetLikes;