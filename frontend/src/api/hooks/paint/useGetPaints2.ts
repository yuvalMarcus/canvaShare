import {useInfiniteQuery} from "@tanstack/react-query";
import * as api from "../../paint.ts";

export const GET_PAINTS = 'getPaints';

const useGetPaints2 = ({userId, tags, order, search}) => {

    const params = {
        userId,
        tags: tags.join(','),
        order,
        canvasName: search || ''
    }

    const {
        data,
        hasNextPage,
        fetchNextPage,
        isFetching,
        isFetchingNextPage,
    } = useInfiniteQuery({
        initialPageParam: 1,
        queryKey: [GET_PAINTS, params],
        queryFn: ({ pageParam }) => api.getPaints({ pageNum: pageParam, ...params}),
        getNextPageParam: (lastPage, allPages) => lastPage.next ? allPages.length + 1 : undefined,
    })

    return {
        data,
        hasNextPage,
        fetchNextPage,
        isFetching,
        isFetchingNextPage
    }
}

export default useGetPaints2;