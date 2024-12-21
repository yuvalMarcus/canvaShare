import Button from "@mui/material/Button";
import {Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Popover} from "@mui/material";
import React, {FC, MutableRefObject, useState} from "react";
import {grey} from "@mui/material/colors";
import PublishIcon from '@mui/icons-material/Publish';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Typography from "@mui/material/Typography";
import {useMutation} from "@tanstack/react-query";
import * as api from "../../../../../api/painter.ts";
import {Canvas} from "fabric";
import {useCanvas} from "../../../../../context/canvas.context.tsx";
import {useNavigate} from "react-router-dom";
import {Bounce, toast} from "react-toastify";

interface FileProps {
    canvas: MutableRefObject<Canvas | null>;
}


const File: FC<FileProps> = ({ canvas }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const { canvas: canvasItem } = useCanvas();

    const navigate = useNavigate();

    const handleOnSuccess = () => {
        toast.success('canvas save successfully', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
        });
        navigate("/artist");
    }

    const handleOnError = () => {
        toast.error('error', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
        });
    }

    const { mutateAsync, isSuccess, isPending } = useMutation({
        mutationFn: api.createPainter,
        onSuccess: handleOnSuccess,
        onError: handleOnError,
    })

    const handlePublish = async () => {

        const photo = canvas.current?.toDataURL({
            format: 'jpeg',
            quality: 0.8
        });

        await mutateAsync({
            ...canvasItem,
            data: JSON.stringify(canvas.current?.toJSON())
        });
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = !!anchorEl;
    const id = open ? 'simple-popover' : undefined;

    return (
        <>
            <Button aria-describedby={id} onClick={handleClick} size="large" variant="text">
                <Typography color={grey[900]} textTransform="capitalize">
                    File
                </Typography>
            </Button>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Box minWidth={300}>
                    <nav aria-label="main mailbox folders">
                        <List>
                            <ListItem disablePadding>
                                {!isPending && (
                                    <ListItemButton onClick={handlePublish}>
                                        <ListItemIcon sx={{ minWidth: 0, marginRight: 1  }}>
                                            <PublishIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Save as Publish" />
                                    </ListItemButton>
                                )}
                                {isPending && (
                                    <ListItemButton>
                                        <ListItemIcon sx={{ minWidth: 0, marginRight: 1  }}>
                                            <PublishIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Saving ..." />
                                    </ListItemButton>
                                )}
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemIcon sx={{ minWidth: 0, marginRight: 1  }}>
                                        <AttachFileIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Save as Draft" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </nav>
                </Box>
            </Popover>
        </>
    )
}

export default File;