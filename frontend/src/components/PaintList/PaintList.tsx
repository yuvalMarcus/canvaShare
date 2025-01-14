import {Box, CircularProgress, Stack} from "@mui/material";
import Card from "./PaintItem/PaintItem.tsx";
import {useInfiniteQuery} from "@tanstack/react-query";
import * as api from "../../api/paint.ts";
import {useInView} from "react-intersection-observer";
import ResultNotFound from "../ResultNotFound/ResultNotFound.tsx"

export const GET_PAINT = 'getPaint';

interface PaintListProps {
    userId?: number;
    tags: string;
    order: string;
    search?: string;
    cardDetails?: boolean;
}

const PaintList = ({cardDetails, userId, tags, order, search}: PaintListProps) => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
    } = useInfiniteQuery({
        initialPageParam: 1,
        queryKey: [GET_PAINT, userId, tags, order, search],
        queryFn: ({ pageParam }) => api.getPaints({ pageNum: pageParam, userId, tags, order, canvasName: search || '' }),
        getNextPageParam: (lastPage) => lastPage.next,
        getPreviousPageParam: (firstPage) => firstPage.prev
    })
    const { ref } = useInView({
        onChange: (inView) => {
            if (!inView) return;
            if (!hasNextPage) return;
            fetchNextPage();
        },
        threshold: 0,
    });

    const results = data?.pages?.flatMap((item) => ([...item.results]));

    return (
        <Stack flexDirection="row" gap={2} justifyContent="center" flexWrap="wrap">
            {results?.map(({id, userId, username, profilePhoto, name, description, likes, tags, photo}) => <Card key={id} id={id} userId={userId} username={username} profilePhoto={profilePhoto} details={cardDetails} name={name} description={description} likes={likes} tags={tags} photo={photo || '/assets/photo1.jpg'} />)}
            {(isFetching || isFetchingNextPage) && (
                <CircularProgress />
            )}
            {!isFetching && !isFetchingNextPage && !results?.length && (
                <ResultNotFound/>
            )}
            <Box ref={ref} />
        </Stack>
    );
}

export default PaintList;