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
    search?: string;
    cardDetails?: boolean;
}

const CanvasList = ({cardDetails, userId, tags, order, search}: CanvasListProps) => {

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
    } = useInfiniteQuery({
        initialPageParam: 1,
        queryKey: [GET_CANVAS, userId, tags, order, search],
        queryFn: ({ pageParam }) => api.getPainters({ pageNum: pageParam, userId, tags, order, canvasName: search || '' }),
        getNextPageParam: (lastPage, pages) => lastPage.canvases,
    })

    const { ref } = useInView({
        onChange: (inView) => {
            if (!inView) return;
            if (!hasNextPage) return;
            fetchNextPage();
        },
        threshold: 0,
    });

    console.log('data', data)

    const results = data?.pages?.flatMap((item) => ([...item.canvases]));

    console.log('results', results)

    return (
        <Stack flexDirection="row" gap={2} justifyContent="center" flexWrap="wrap">
            {!(isFetching || isFetchingNextPage) && results?.map(({id, userId, username, profilePhoto, name, description, likes, tags, photo}) => <Card key={id} id={id} userId={userId} username={username} profilePhoto={profilePhoto} details={cardDetails} name={name} description={description} likes={likes} tags={tags} photo={photo || '/assets/photo1.jpg'} />)}
            {(isFetching || isFetchingNextPage) && (
                <CircularProgress />
            )}
            <Box ref={ref} />
        </Stack>
    );
}

export default CanvasList;