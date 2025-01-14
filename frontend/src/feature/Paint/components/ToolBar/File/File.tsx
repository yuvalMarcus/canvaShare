import Button from "@mui/material/Button";
import {Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Popover} from "@mui/material";
import React, {FC, MutableRefObject, useState} from "react";
import {grey} from "@mui/material/colors";
import PublishIcon from '@mui/icons-material/Publish';
import Typography from "@mui/material/Typography";
import {useMutation} from "@tanstack/react-query";
import * as api from "../../../../../api/paint.ts";
import {Canvas} from "fabric";
import {useNavigate, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {useUpload} from "../../../../../hooks/useUpload.ts";
import { usePaint } from '../../../../../context/paint.context.tsx';
import {useAuth} from "../../../../../context/auth.context.tsx";
import useGetPaint from "../../../../../api/hooks/paint/useGetPaint.ts";
import SaveIcon from '@mui/icons-material/Save';

interface FileProps {
    paint: MutableRefObject<Canvas | null>;
}

const FileO: FC<FileProps> = ({ paint }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const { payload: payloadItem } = usePaint();

    const { id: paintId } = useParams();

    const { data: data22 } = useGetPaint(paintId ? Number(paintId) : undefined);

    const { uploadFileCode } = useUpload();

    const { userId } = useAuth();

    const navigate = useNavigate();

    const handleOnSuccess = () => {
        toast.success('Paint saved successfully');
        navigate(`/artist/${userId}`);
    }

    const handleOnError = (e) => {
        let error_msg;
        if (e?.status == 422){
            const field = e?.response?.data?.detail[0].loc[1]
            error_msg = `Invalid ${field}`;
        }
        else
            error_msg = e?.response?.data?.detail;
        toast.error(error_msg);
    }

    const { mutateAsync, isSuccess, isPending } = useMutation({
        mutationFn: api.createPaint,
        onSuccess: handleOnSuccess,
        onError: handleOnError,
    })

    const { mutateAsync: mutateAsyncu, isPending: isPendingx } = useMutation({
        mutationFn: (payload) => api.updatePaint(Number(paintId), payload),
        onSuccess: handleOnSuccess,
        onError: handleOnError,
    })

    const handlePublish = async () => {

        const photo = paint.current?.toDataURL({
            format: 'jpeg',
            quality: 0.8
        });

        const { data } = photo ? await uploadFileCode(photo, 'hello.png','image/jpeg') : { data: { photo: '' } };

        if(paintId) {

            const  dataToUpdate = Object.entries(payloadItem).filter(([_, value]) => Boolean(value)).reduce((prev, [key, value]) => {
                prev[key] = value;
                return prev;
            }, {})

            await mutateAsyncu({
                name: dataToUpdate?.name || data22?.name,
                description: dataToUpdate?.description || data22?.description,
                tags: dataToUpdate?.tags || data22?.tags,
                isPublic: true,
                photo: data.photo,
                data: JSON.stringify(paint.current?.toJSON())
            }).catch(e => {});

        } else {

            await mutateAsync({
                ...payloadItem,
                name: payloadItem.name || "Untitled Paint",
                tags: payloadItem.tags || [],
                photo: data.photo,
                data: JSON.stringify(paint.current?.toJSON())
            }).catch(e => {});

        }
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
                                            {paintId ? <SaveIcon /> : <PublishIcon />}
                                        </ListItemIcon>
                                        <ListItemText primary="Save as Publish" />
                                    </ListItemButton>
                                )}
                                {isPending && (
                                    <ListItemButton>
                                        <ListItemIcon sx={{ minWidth: 0, marginRight: 1  }}>
                                            {paintId ? <SaveIcon /> : <PublishIcon />}
                                        </ListItemIcon>
                                        <ListItemText primary="Saving..." />
                                    </ListItemButton>
                                )}
                            </ListItem>
                        </List>
                    </nav>
                </Box>
            </Popover>
        </>
    )
}

export default FileO;