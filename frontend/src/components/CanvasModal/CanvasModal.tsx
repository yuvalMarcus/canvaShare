import * as React from "react";
import {Link, useParams} from "react-router-dom";
import {Avatar, Box, CircularProgress, IconButton, Modal, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {grey} from "@mui/material/colors";
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import {useMutation, useQuery} from "@tanstack/react-query";
import * as likeApi from "../../api/like.ts";
import * as painterApi from "../../api/painter.ts";
import {queryClient} from "../../main.tsx";
import {GET_CANVAS} from "../CanvasList/CanvasList.tsx";
import {useAuth} from "../../context/auth.context.tsx";
import {getPainter} from "../../api/painter.ts";

const GET_LIKE = 'getLike';
const GET_LIKES = 'getLikes';
interface CanvasModalProps {
    isOpen: boolean;
    id: number;
    painterUserId: number;
    username: string;
    profilePhoto: string;
    name: string;
    description: string;
    likes: number;
    tags: string[];
    photo: string;
    onClose: () => void;
}

const CanvasModal = ({ id, painterUserId, username, profilePhoto, name, description, tags, photo, isOpen, onClose }: CanvasModalProps) => {

    const { userId } = useAuth();


    const { data: like, loadLikeIsPending } = useQuery({
        queryKey: [GET_LIKE, id, userId],
        queryFn: () => likeApi.getLikes({ canvas_id: id, user_id: userId }),
    });

    const { data: likes, loadLikesIsPending } = useQuery({
        queryKey: [GET_LIKES, id],
        queryFn: () => likeApi.getLikes({ canvas_id: id }),
    });

    const { mutateAsync: createLike, isPending: createLikeIsPending } = useMutation({
        mutationFn: likeApi.createLike,
    });

    const { mutateAsync: deleteLike, isPending : deleteLikeIsPending } = useMutation({
        mutationFn: likeApi.deleteLike,
    });

    const { mutateAsync: deletePainter, isPending : deletePainterIsPending } = useMutation({
        mutationFn: painterApi.deletePainter,
    });

    const handleLike = async () => {
        await createLike({ canvasId: id, userId });
        queryClient.invalidateQueries({ queryKey: [GET_LIKE] });
        queryClient.invalidateQueries({ queryKey: [GET_LIKES] });
    }

    const handleUnLike = async () => {
        const likeId = like?.results.at(0).id;
        if(likeId) await deleteLike(likeId);
        queryClient.invalidateQueries({ queryKey: [GET_LIKE] });
        queryClient.invalidateQueries({ queryKey: [GET_LIKES] });
    }

    const handleDeletePainter = async () => {
        if(id) await deletePainter(id);
        queryClient.invalidateQueries({ queryKey: [GET_CANVAS] });
    }

    const isPending = loadLikeIsPending || loadLikesIsPending || createLikeIsPending || deleteLikeIsPending;
    const hasLike = !!like?.results?.length;
    
    const isUserProfileOwner = userId === painterUserId;

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            aria-labelledby={name}
            aria-describedby={description}
        >
            <Stack flexDirection="row">
                <Stack flexDirection="row" position="absolute" top="50%" left="50%" border={2} borderColor={grey[900]} boxShadow={24} sx={{
                    transform: 'translate(-50%, -50%)',
                }}>
                    <Box position="relative" width={1000} height={800} sx={{ backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        {isUserProfileOwner && (
                            <Stack flexDirection="row" position="absolute" zIndex={10} sx={{ backgroundColor: grey[900] }}>
                                <IconButton component={Link} to={`/painter/${id}`}>
                                    <EditIcon sx={{ color: grey[100] }} />
                                </IconButton>
                                <IconButton onClick={handleDeletePainter}>
                                    <DeleteIcon sx={{ color: grey[100] }} />
                                </IconButton>
                            </Stack>
                        )}
                    </Box>
                    <Stack minWidth={250} sx={{ backgroundColor: grey[100] }}>
                        <Stack flexDirection="row" alignItems="center" justifyContent="space-between" p={1}>
                            <Button component={Link} to={`/artist/${painterUserId}`}>
                                <Avatar alt="avatar" src={profilePhoto ?? "/assets/default-user.png"}  sx={{ width: 30, height: 30, boxShadow: 4, backgroundColor: '#fff' }} />
                                <Typography color={grey[900]} ml={2}>
                                    {username}
                                </Typography>
                            </Button>
                            <CloseIcon onClick={onClose} cursor="pointer" />
                        </Stack>
                        <Stack flex={1} gap={2} p={2}>
                            <Stack flexDirection="row" gap={1} alignItems="center">
                                <Typography color={grey[900]} variant="h5">
                                    {name}
                                </Typography>
                            </Stack>
                            <Typography color={grey[900]} component="p">
                                {description}
                            </Typography>
                        </Stack>
                        <Stack gap={1} p={2}>
                            <Typography variant="h5">Tags</Typography>
                            <Stack flexDirection="row" columnGap={1} flexWrap="wrap">
                                {tags?.map(text => <Typography key={text} textTransform="capitalize" color="info">#{text}</Typography>)}
                            </Stack>
                        </Stack>
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
                    </Stack>
                </Stack>
            </Stack>
        </Modal>
    )
}

export default CanvasModal;