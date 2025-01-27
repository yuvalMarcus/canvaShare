import {Link, useNavigate} from "react-router-dom";
import {Avatar, Box, IconButton, Modal, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {grey} from "@mui/material/colors";
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {queryClient} from "../../main.tsx";
import {useAuth} from "../../context/auth.context.tsx";
import ReportModal from "../ReportModal/ReportModal.tsx";
import useRemovePaint2 from "../../api/hooks/paint/useRemovePaint2.ts";
import {GET_PAINT} from "../../api/hooks/paint/useGetPaint.ts";
import Like from "./Like/Like.tsx";
import {GET_PAINTS} from "../../api/hooks/paint/useGetPaints.ts";
import {toast} from "react-toastify";
import {ReportType} from "../ReportModal/ReportModal.config.ts";
import {GET_USERS} from "../../api/hooks/user/useGetUsers.ts";

interface PaintModalProps {
    isOpen: boolean;
    id: number;
    userId: number;
    username: string;
    profilePhoto: string;
    name: string;
    description: string;
    likes: number;
    tags: string[];
    photo: string;
    onClose: () => void;
}

const PaintModal = ({ id, userId, username, profilePhoto, name, description, tags, photo, isOpen, onClose }: PaintModalProps) => {

    const { userId: userAuthId } = useAuth();

    const navigate = useNavigate();

    const handleOnSuccess = () => {
        toast.success('Paint remove successfully');

        queryClient.invalidateQueries({ queryKey: [GET_PAINT] });
        queryClient.invalidateQueries({ queryKey: [GET_PAINTS] });
        queryClient.invalidateQueries({ queryKey: [GET_USERS] });
    }

    const { remove: removePaint } = useRemovePaint2({ onSuccess: handleOnSuccess });

    const handleDeletePaint = async () => {
        if(id) removePaint(id);
    }

    const isUserProfileOwner = userAuthId === userId;

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
                <Box position="relative" width={1000} height={800} bgcolor={grey[800]} sx={{ backgroundImage: `url(${photo})`, backgroundSize: "100%", backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
                    {isUserProfileOwner && (
                        <Stack flexDirection="row" position="absolute" zIndex={10} sx={{ backgroundColor: grey[900] }}>
                            <IconButton component={Link} to={`/paint/${id}`}>
                                <EditIcon sx={{ color: grey[100] }} />
                            </IconButton>
                            <IconButton onClick={handleDeletePaint}>
                                <DeleteIcon sx={{ color: grey[100] }} />
                            </IconButton>
                        </Stack>
                    )}
                </Box>
                <Stack width={300} sx={{ backgroundColor: grey[100] }}>
                    <Stack flexDirection="row" alignItems="center" justifyContent="space-between" p={1}>
                        <Button onClick={() => {
                            navigate(`/artist/${userId}`);
                            onClose();
                        }}>
                            <Avatar alt="avatar" src={profilePhoto ?? "/assets/default-user.png"} sx={{ width: 30, height: 30, boxShadow: 4, backgroundColor: '#fff' }} />
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
                    <Stack flexDirection="row" justifyContent="space-between">
                        <Like paintId={id} />
                        <ReportModal type={ReportType.PAINT} paintId={id} userId={userId} />
                    </Stack>
                </Stack>
            </Stack>
        </Stack>
    </Modal>
    )
}

export default PaintModal;