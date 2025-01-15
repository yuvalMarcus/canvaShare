import Typography from '@mui/material/Typography';
import {useState} from "react";
import {Avatar, Stack} from "@mui/material";
import * as S from './PaintItem.style.ts';
import {grey} from "@mui/material/colors";
import PreviewIcon from '@mui/icons-material/Preview';
import PaintModal from "../../PaintModal/PaintModal.tsx";

interface PaintItemProps {
    id: number;
    userId: number;
    username: string;
    profilePhoto: string;
    name: string;
    description: string;
    likes: number;
    tags: string[];
    photo: string;
    details?: boolean;
}

const PaintItem = (props: PaintItemProps) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const { username, profilePhoto, name, photo, details } = props;

    return (
        <>
            <S.Controller onClick={() => setModalIsOpen(true)}>
                <S.CardController
                    position="relative"
                    flexDirection="column"
                    justifyContent="flex-end"
                    height="auto"
                    photo={photo || '/assets/photo1.jpg'}
                >
                    <Stack alignItems="center" justifyContent="center" position="absolute" zIndex={10} top={0} right={0} width={30} height={30} sx={{ backgroundColor: grey[800] }}>
                        <PreviewIcon sx={{ color: grey[100] }} />
                    </Stack>
                    {details && (
                        <Stack flexDirection="row" py={1} px={2} gap={1} sx={{ backgroundColor: "rgb(0 0 0 / 80%)" }}>
                            <Avatar alt={`${username} avatar`} src={profilePhoto ?? "/assets/default-user.png"} sx={{ width: 30, height: 30, boxShadow: 4, backgroundColor: '#fff' }} />
                            <Typography color={grey[100]} variant="h5">
                                {name}
                            </Typography>
                        </Stack>
                    )}
                </S.CardController>
            </S.Controller>
            <PaintModal id={props.id} {...props} isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)} />
        </>
    );
}

export default PaintItem;