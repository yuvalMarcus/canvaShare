import {Stack} from "@mui/material";
import {FC, MutableRefObject} from "react";
import Button from "@mui/material/Button";
import {Canvas} from "fabric";

interface PhotoProps {
    canvas: MutableRefObject<Canvas | null>;
    selectedId: string | null;
    onClose: () => void;
}

const Photo: FC<PhotoProps> = ({ canvas, selectedId, onClose }) => {
    const object = canvas.current?.getObjects().find(({data}) => data?.id === selectedId);
    const handleRemovePhoto = () => {
        if(!object) return;

        canvas.current?.remove(object);
        canvas.current?.renderAll();
    }

    return (
        <Stack gap={2} pb={2}>
            <Button variant="contained" color={'error'} onClick={handleRemovePhoto}>remove photo</Button>
        </Stack>
    )
}

export default Photo;