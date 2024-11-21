import * as React from "react";
import {Link} from "react-router-dom";
import {Avatar, Box, Modal, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {grey} from "@mui/material/colors";
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface CanvasModalProps {
    isOpen: boolean;
    onClose: () => void;
    name: string;
    description: string;
    photo: string;

}

const CanvasModal = ({ name, description, photo, isOpen, onClose }: CanvasModalProps) => {
    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            aria-labelledby={name}
            aria-describedby={description}
        >
            <Stack flexDirection="row">
                <Box position="absolute" top="50%" p={2} sx={{ transform: 'translateY(-50%)' }}>
                    <ArrowBackIosNewIcon fontSize="large" sx={{ color: grey[100] }} />
                </Box>
                <Box position="absolute" top="50%" left="50%" border={2} borderColor={grey[900]} boxShadow={24} sx={{
                    transform: 'translate(-50%, -50%)',
                }}>
                    <Stack flexDirection="row">
                        <Box position="relative">
                            <Stack flexDirection="row" position="absolute" zIndex={10} sx={{ backgroundColor: grey[900] }}>
                                <Button component={Link} to="/painter" sx={{ minWidth: 40 }}>
                                    <EditIcon sx={{ color: grey[100] }} />
                                </Button>
                                <Button sx={{ minWidth: 40 }}>
                                    <DeleteIcon sx={{ color: grey[100] }} />
                                </Button>
                            </Stack>
                            <img src={photo} height="100%" width="auto" />
                        </Box>
                        <Stack minWidth={250} sx={{ backgroundColor: grey[100] }}>
                            <Stack flexDirection="row" alignItems="center" justifyContent="space-between" p={1}>
                                <Button component={Link} to="/artist">
                                    <Avatar alt="avatar" src="/assets/p_avatar.jpg"  sx={{ width: 30, height: 30, boxShadow: 4, backgroundColor: '#fff' }} />
                                    <Typography color={grey[900]} ml={2}>
                                        nickname
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
                                    {['animals', 'nature', 'cars', 'dogs'].map(text => <Typography key={text} textTransform="capitalize" color="info">#{text}</Typography>)}
                                </Stack>
                            </Stack>
                            <Stack flexDirection="row" alignItems="center">
                                <Button>
                                    <FavoriteBorderIcon color={"error"} fontSize="large" />
                                </Button>
                                <Typography color={grey[900]} fontWeight="bold">
                                    1,704
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                </Box>
                <Box position="absolute" top="50%" right={0} p={2} sx={{ transform: 'translateY(-50%)' }}>
                    <ArrowForwardIosIcon fontSize="large" sx={{ color: grey[100] }} />
                </Box>
            </Stack>
        </Modal>
    )
}

export default CanvasModal;