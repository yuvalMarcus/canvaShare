import {FC, useState} from 'react';
import Box from '@mui/material/Box';
import ImageIcon from '@mui/icons-material/Image';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';

interface ImageModalProps {
    link: string;
}

const ImageModal: FC<ImageModalProps> = ({ link }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <IconButton onClick={() => setOpen(true)}>
                <ImageIcon />
            </IconButton>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="image-modal-title"
                aria-describedby="image-modal-description">
                <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" p={4}>
                    <img srcSet={link} height={700} alt={link} />
                </Box>
            </Modal>
        </>
    );
}

export default ImageModal;