import * as React from 'react';
import Typography from '@mui/material/Typography';
import {Stack} from "@mui/material";
import {useNavigate} from "react-router-dom";
import * as S from './Artist.style.ts';
import {grey} from "@mui/material/colors";
import PersonIcon from '@mui/icons-material/Person';

interface CanvasItemProps {
    name: string;
    photo: string;
}

const Artist = ({ name, photo }: CanvasItemProps) => {
    const navigate = useNavigate();

    return (
        <S.Controller onClick={() => navigate('/artist')}>
            <S.CardController
                flexDirection="column"
                justifyContent="flex-end"
                height="auto"
                photo={photo}
            >
                <Stack py={1} px={2} gap={1} sx={{ backgroundColor: "rgb(0 0 0 / 80%)" }}>
                    <Stack flexDirection="row" alignItems="center" gap={1}>
                        <PersonIcon sx={{ color: grey[100] }} />
                        <Typography color={grey[100]} variant="h5">
                            {name}
                        </Typography>
                    </Stack>
                </Stack>
            </S.CardController>
        </S.Controller>
    );
}

export default Artist;