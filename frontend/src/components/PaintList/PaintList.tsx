import {Box, CircularProgress, Stack} from "@mui/material";
import Card from "./PaintItem/PaintItem.tsx";
import {useInView} from "react-intersection-observer";
import ResultNotFound from "../ResultNotFound/ResultNotFound.tsx"
import {FC} from "react";
import useGetPaints2 from "../../api/hooks/paint/useGetPaints2.ts";

interface PaintListProps {
    userId?: number;
    tags: string[];
    order: string;
    search?: string;
    cardDetails?: boolean;
}

const PaintList: FC<PaintListProps> = ({cardDetails, userId, tags, order, search}) => {

    const { data, hasNextPage, fetchNextPage, isFetching, isFetchingNextPage } = useGetPaints2({ userId, tags, order, search });

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
        <Box>
            {!!results?.length && <Stack flexDirection="row" gap={2} justifyContent="center" flexWrap="wrap">
                {results?.map((paint) => <Card key={paint.id} {...paint} />)}
            </Stack>}
            {(isFetching || isFetchingNextPage) && (
                <Stack flexDirection="row" justifyContent="center">
                    <CircularProgress />
                </Stack>
            )}
            {!isFetching && !isFetchingNextPage && !results?.length && (
                <ResultNotFound/>
            )}
            <Box ref={ref} />
        </Box>
    );
}

export default PaintList;