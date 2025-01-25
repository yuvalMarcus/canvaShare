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
import useCreatePaint from "../../../../../api/hooks/paint/useCreatePaint.ts";
import useUpdatePaint from "../../../../../api/hooks/paint/useUpdatePaint.ts";

interface FileProps {
    canvas: MutableRefObject<Canvas | null>;
}

const FileO: FC<FileProps> = ({ canvas }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const { payload: payloadItem } = usePaint();

    const { id: paintId } = useParams();

    const { data: paint } = useGetPaint(paintId ? Number(paintId) : undefined);

    const { uploadFileCode } = useUpload();

    const { userId } = useAuth();

    const navigate = useNavigate();

    const handleOnSuccess = () => {
        toast.success('Paint saved successfully');
        navigate(`/artist/${userId}`);
    }

    const handleOnError = (error) => {
        let error_msg;
        if (error?.status == 422){
            const field = error?.response?.data?.detail[0].loc[1]
            error_msg = `Invalid ${field}`;
        }
        else
            error_msg = error?.response?.data?.detail;
        toast.error(error_msg);
    }

    const { create, isPending: createPaintIsPending } = useCreatePaint({ onSuccess: handleOnSuccess, onError: handleOnError })

    const { update, isPending: updatePaintIsPending } = useUpdatePaint({ onSuccess: handleOnSuccess, onError: handleOnError })

    const handlePublish = async (draft: boolean = false) => {

        const photo = canvas.current?.toDataURL({
            format: 'jpeg',
            quality: 0.8
        });

        const { data } = photo ? await uploadFileCode(photo, 'hello.png','image/jpeg') : { data: { photo: '' } };

        if(paintId) {

            const dataToUpdate = Object.entries(payloadItem).filter(([_, value]) => Boolean(value)).reduce((prev, [key, value]) => {
                prev[key] = value;
                return prev;
            }, {})

            update({
                id: paintId,
                payload: {
                    name: dataToUpdate?.name || paint?.name,
                    description: dataToUpdate?.description || paint?.description,
                    tags: dataToUpdate?.tags || paint?.tags || [],
                    isPublic: !draft,
                    photo: data.photo,
                    data: JSON.stringify(canvas.current?.toJSON())
                }
            });

        } else {

            create({
                ...payloadItem,
                name: payloadItem.name || "Untitled Paint",
                tags: payloadItem.tags || [],
                isPublic: !draft,
                photo: data.photo,
                data: JSON.stringify(canvas.current?.toJSON())
            });

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
                                {paint && !createPaintIsPending && !updatePaintIsPending && (
                                    <ListItemButton onClick={() => handlePublish(!paint?.isPublic)}>
                                        <ListItemIcon sx={{ minWidth: 0, marginRight: 1  }}>
                                            {paintId ? <SaveIcon /> : <PublishIcon />}
                                        </ListItemIcon>
                                        <ListItemText primary="Save" />
                                    </ListItemButton>
                                )}
                            </ListItem>
                            <ListItem disablePadding>
                                {(!paint || (paint?.isPublic && !createPaintIsPending && !updatePaintIsPending)) && (
                                    <ListItemButton onClick={() => handlePublish(true)}>
                                        <ListItemIcon sx={{ minWidth: 0, marginRight: 1  }}>
                                            <PublishIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Save as Draft" />
                                    </ListItemButton>
                                )}
                            </ListItem>
                            <ListItem disablePadding>
                                {(!paint || (!paint?.isPublic && !createPaintIsPending && !updatePaintIsPending)) && (
                                    <ListItemButton onClick={() => handlePublish(false)}>
                                        <ListItemIcon sx={{ minWidth: 0, marginRight: 1  }}>
                                            <PublishIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Publish" />
                                    </ListItemButton>
                                )}
                            </ListItem>
                            <ListItem disablePadding>
                                {createPaintIsPending || updatePaintIsPending && (
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