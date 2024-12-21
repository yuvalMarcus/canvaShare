import {Box, CircularProgress, Stack} from "@mui/material";
import Card from "./CanvasItem/CanvasItem.tsx";
import {useInfiniteQuery} from "@tanstack/react-query";
import * as api from "../../api/painter.ts";
import {useInView} from "react-intersection-observer";

export const GET_CANVAS = 'getCanvas';

interface CanvasListProps {
    userId?: number;
    tags: string;
    order: string;
    cardDetails?: boolean;
}

const CanvasList = ({cardDetails, userId, tags, order}: CanvasListProps) => {

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
    } = useInfiniteQuery({
        initialPageParam: 1,
        queryKey: [GET_CANVAS, userId, tags, order],
        queryFn: ({ pageParam }) => api.getPainters({ pageParam, userId, tags, order }),
        getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
    })

    const { ref } = useInView({
        onChange: (inView) => {
            if (!inView) return;
            if (!hasNextPage) return;
            fetchNextPage();
        },
        threshold: 0,
    });

    const results = data?.pages?.flatMap((item) => ([...item.canvases]));

    return (
        <Stack flexDirection="row" gap={2} justifyContent="center" flexWrap="wrap">
            {!(isFetching || isFetchingNextPage) && results?.map(({id, userId, name, description, likes, tags, photo}) => <Card key={id} id={id} userId={userId} details={cardDetails} name={name} description={description} likes={likes} tags={tags} photo={photo || '/assets/photo1.jpg'} />)}
            {(isFetching || isFetchingNextPage) && (
                <CircularProgress />
            )}
            <Box ref={ref} />
        </Stack>
    );
}

export default CanvasList;