import {Box, Stack} from "@mui/material";
import {grey} from "@mui/material/colors";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from '@mui/icons-material/Delete';
import React, {MutableRefObject} from "react";
import Text from "../Toolkit/Text/Text.tsx";
import Shape from "../Toolkit/Shape/Shape.tsx";
import {Canvas} from "fabric";

interface CanvasMenuProps {
    canvas: MutableRefObject<Canvas | null>;
    position: { x: number, y: number }| null;
    selectedId: string | null;
    onClose: () => void;
}


const CanvasMenu = ({canvas, position, selectedId}: CanvasMenuProps) => {

    const object = canvas.current?.getObjects().find(({id}) => id === selectedId);

    return (
        <Box position="absolute" top={position?.y} left={position?.x} zIndex={10} boxShadow={2} p={2} display={selectedId ? 'block' : 'none'} sx={{ backgroundColor: grey[100] }}>
            <Stack flexDirection="row" justifyContent="space-between" mb={2}>
                <Button className="handle" sx={{ minWidth: 0, border: 2, borderColor: grey[300], p: 0.5 }}>
                    <DeleteIcon sx={{ color: grey[900] }} />
                </Button>
                <Button sx={{ minWidth: 0, border: 2, borderColor: grey[300], p: 0.5 }} onClick={() => {}}>
                    <CloseIcon sx={{ color: grey[900] }} />
                </Button>
            </Stack>
            {object?.category === "text" && <Text canvas={canvas} onClose={()=> {}} />}
            {object?.category === "shape" && <Shape canvas={canvas} onClose={()=> {}} />}
        </Box>
    )
}

export default CanvasMenu;