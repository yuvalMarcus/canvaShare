import {Box, CircularProgress, IconButton, Stack} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Typography from "@mui/material/Typography";
import {grey} from "@mui/material/colors";
import {queryClient} from "../../../main.tsx";
import useGetLikes, {GET_LIKES} from "../../../api/hooks/like/useGetLikes.ts";
import useCreateLike from "../../../api/hooks/like/useCreateLike.ts";
import useRemoveLike from "../../../api/hooks/like/useRemoveLike.ts";
import {useAuth} from "../../../context/auth.context.tsx";
import {toast} from "react-toastify";

interface LikeProps {
    paintId: number;
    userId: number;
}

const Like = ({ paintId, userId }: LikeProps) => {

    const { userId: userAuthId } = useAuth();

    const handleOnSuccess = () => {
        toast.success('Like update successful');
        queryClient.invalidateQueries({ queryKey: [GET_LIKES] });
    }

    const handleOnError = () => {
        toast.error('Like upload failed');
    }

    const { data: like, isPending: loadLikeIsPending } = useGetLikes({ paintId, userId: userAuthId || 1 });

    const { data: likes, isPending: loadLikesIsPending } = useGetLikes({ paintId, userId });

    const { create, isPending: createLikeIsPending } = useCreateLike({ onSuccess: handleOnSuccess, onError: handleOnError });

    const { remove, isPending: deleteLikeIsPending } = useRemoveLike({ onSuccess: handleOnSuccess, onError: handleOnError });

    const handleLike = async () => {
        if (!paintId || !userAuthId) return;
        create({ canvasId: paintId, userId: userAuthId });
    }

    const handleUnLike = async () => {
        const likeId = like?.results.at(0).id;
        if(likeId) remove(likeId);
    }

    const isPending = loadLikeIsPending || loadLikesIsPending || createLikeIsPending || deleteLikeIsPending;
    const hasLike = !!like?.results?.length;

    return (
        <Stack flexDirection="row" alignItems="center">
            {isPending && (
                <Box p={1}>
                    <CircularProgress size={24} />
                </Box>
            )}
            {!isPending && hasLike && (
                <IconButton onClick={handleUnLike} disabled={isPending}>
                    <FavoriteIcon color={"error"} fontSize="large" />
                </IconButton>
            )}
            {!isPending && !hasLike && (
                <IconButton onClick={handleLike} disabled={isPending}>
                    <FavoriteBorderIcon color={"error"} fontSize="large" />
                </IconButton>
            )}
            <Typography color={grey[900]} fontWeight="bold">
                {likes?.results?.length}
            </Typography>
        </Stack>
    )
}

export default Like;