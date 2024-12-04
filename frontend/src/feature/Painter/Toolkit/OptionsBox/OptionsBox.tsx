import {Box, IconButton, Stack} from "@mui/material";
import {green, grey} from "@mui/material/colors";
import Button from "@mui/material/Button";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import CloseIcon from "@mui/icons-material/Close";
import Brushes from "../Brushes/Brushes.tsx";
import Text from "../Text/Text.tsx";
import Shape from "../Shape/Shape.tsx";
import React, {MutableRefObject} from "react";
import {Canvas} from "fabric";
import Typography from "@mui/material/Typography";
import Photo from "../Photo/Photo.tsx";

interface OptionsBoxProps {
    canvas: MutableRefObject<Canvas | null>;
    actionType: "draw" | "text" | "shape" | "photo" | null;
    onClose: () => void;
}
const OptionsBox = ({canvas, actionType, onClose}: OptionsBoxProps) => {
    return (
    <Box position="absolute" top={0} left={0} zIndex={10} boxShadow={2} px={2} py={1} minWidth={200} sx={{ backgroundColor: grey[800], display: actionType ? 'block' : 'none'}} >
        <Stack flexDirection="row" alignItems="center" justifyContent="flex-end">
            <IconButton onClick={onClose}>
                <CloseIcon sx={{ color: grey[100] }} />
            </IconButton>
        </Stack>
        {actionType === "draw" && <Brushes canvas={canvas} />}
        {actionType === "text" && <Text canvas={canvas} onClose={onClose} />}
        {actionType === "shape" && <Shape canvas={canvas} onClose={onClose} />}
        {actionType === "photo" && <Photo canvas={canvas} />}
    </Box>
    )
}

export default OptionsBox;