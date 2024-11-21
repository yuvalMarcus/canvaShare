import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {useState} from "react";
import {Avatar, Box, Modal, Stack} from "@mui/material";
import {Link} from "react-router-dom";
import * as S from './CanvasItem.style.ts';
import {CardController} from "./CanvasItem.style.ts";
import {grey} from "@mui/material/colors";
import PreviewIcon from '@mui/icons-material/Preview';
import CanvasModal from "../../CanvasModal/CanvasModal.tsx";

interface CanvasItemProps {
    name: string;
    description: string;
    photo: string;
    details?: boolean;
}

const CanvasItem = ({ name, description, photo, details }: CanvasItemProps) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);

    return (
        <>
            <S.Controller onClick={() => setModalIsOpen(true)}>
                <S.CardController
                    position="relative"
                    flexDirection="column"
                    justifyContent="flex-end"
                    height="auto"
                    photo={photo}
                >
                    <Stack alignItems="center" justifyContent="center" position="absolute" zIndex={10} top={0} right={0} width={30} height={30} sx={{ backgroundColor: grey[800] }}>
                        <PreviewIcon sx={{ color: grey[100] }} />
                    </Stack>
                    {details && (
                        <Stack flexDirection="row" py={1} px={2} gap={1} sx={{ backgroundColor: "rgb(0 0 0 / 80%)" }}>
                            <Avatar alt="Remy Sharp" src="/assets/p_avatar.jpg" sx={{ width: 30, height: 30, boxShadow: 4, backgroundColor: '#fff' }} />
                            <Typography color={grey[100]} variant="h5">
                                {name}
                            </Typography>
                        </Stack>
                    )}
                </S.CardController>
            </S.Controller>
            <CanvasModal name={name} description={description} photo={photo} isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)} />
        </>
    );
}

export default CanvasItem;