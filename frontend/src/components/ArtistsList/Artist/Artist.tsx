import Typography from '@mui/material/Typography';
import {Stack} from "@mui/material";
import {useNavigate} from "react-router-dom";
import * as S from './Artist.style.ts';
import {grey} from "@mui/material/colors";
import PersonIcon from '@mui/icons-material/Person';

interface PaintItemProps {
    id: string;
    username: string;
    profilePhoto: string;
}

const Artist = ({ id, username, profilePhoto }: PaintItemProps) => {
    const navigate = useNavigate();

    return (
        <S.Controller onClick={() => navigate(`/artist/${id}`)}>
            <S.CardController
                flexDirection="column"
                justifyContent="flex-end"
                height="auto"
                photo={profilePhoto || "/assets/default-user-simple.png"}
            >
                <Stack py={1} px={2} gap={1} sx={{ backgroundColor: "rgb(0 0 0 / 80%)" }}>
                    <Stack flexDirection="row" alignItems="center" gap={1}>
                        <PersonIcon sx={{ color: grey[100] }} />
                        <Typography color={grey[100]} variant="h5">
                            {username}
                        </Typography>
                    </Stack>
                </Stack>
            </S.CardController>
        </S.Controller>
    );
}

export default Artist;