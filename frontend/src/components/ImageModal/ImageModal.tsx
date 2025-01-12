import {useState} from 'react';
import Box from '@mui/material/Box';
import ImageIcon from '@mui/icons-material/Image';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    p: 4,
};

export default function ImageModal({link}: {link: string | null}) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    return (<>
            {link !== null &&
                (<div>
                <IconButton onClick={handleOpen}>
                    <ImageIcon />
                </IconButton>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <img srcSet={link} style={{ height: 700 }} alt={link} />
                    </Box>
                </Modal>
            </div>)}
        </>
    );
}