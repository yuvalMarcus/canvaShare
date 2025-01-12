import {Stack} from "@mui/material";
import React, {FC, MutableRefObject} from "react";
import Button from "@mui/material/Button";
import {Canvas} from "fabric";

interface PhotoProps {
    paint: MutableRefObject<Canvas | null>;
    selectedId: string | null;
    onClose: () => void;
}

const Photo: FC<PhotoProps> = ({ paint, selectedId, onClose }) => {
    const object = paint.current?.getObjects().find(({data}) => data.id === selectedId);
    const handleRemovePhoto = () => {
        if(!object) return;

        paint.current?.remove(object);
        paint.current?.renderAll();
    }

    return (
        <Stack gap={2} pb={2}>
            <Button variant="contained" color={'error'} onClick={handleRemovePhoto}>remove photo</Button>
        </Stack>
    )
}

export default Photo;