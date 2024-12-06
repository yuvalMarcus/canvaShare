import React, {MutableRefObject} from "react";
import {Canvas} from "fabric";
import Draggable from 'react-draggable';
import {Box, Stack} from "@mui/material";
import {grey} from "@mui/material/colors";
import Button from "@mui/material/Button";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import CloseIcon from "@mui/icons-material/Close";
import Draw from "../Draw/Draw.tsx";
import Text from "../Text/Text.tsx";
import Shape from "../Shape/Shape.tsx";
import Photo from "../Photo/Photo.tsx";

interface ToolkitBoxProps {
    canvas: MutableRefObject<Canvas | null>;
    actionType: "draw" | "text" | "shape" | "photo" | null;
    onClose: () => void;
}

const ToolkitBox = ({canvas, actionType, onClose}: ToolkitBoxProps) => {

    return (
        <Draggable
            axis="both"
            handle=".handle">
            <Box position="absolute" top={0} left={0} zIndex={10} boxShadow={2} px={2} py={1} sx={{ backgroundColor: grey[100], display: actionType ? 'block' : 'none'}} >
                <Stack flexDirection="row" justifyContent="space-between" mb={2}>
                    <Button className="handle" sx={{ minWidth: 0, border: 2, borderColor: grey[300], p: 0.5 }}>
                        <CenterFocusStrongIcon sx={{ color: grey[900] }} />
                    </Button>
                    <Button sx={{ minWidth: 0, border: 2, borderColor: grey[300], p: 0.5 }} onClick={onClose}>
                        <CloseIcon sx={{ color: grey[900] }} />
                    </Button>
                </Stack>
                {actionType === "draw" && <Draw canvas={canvas} />}
                {actionType === "text" && <Text canvas={canvas} />}
                {actionType === "shape" && <Shape canvas={canvas} />}
            </Box>
        </Draggable>
    )
}

export default ToolkitBox;