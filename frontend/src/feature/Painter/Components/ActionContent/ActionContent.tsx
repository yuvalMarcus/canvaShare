import {Box, IconButton, Stack} from "@mui/material";
import {grey} from "@mui/material/colors";
import CloseIcon from "@mui/icons-material/Close";
import Draw from "../../Toolkit/Draw/Draw.tsx";
import Text from "../../Toolkit/Text/Text.tsx";
import Shape from "../../Toolkit/Shape/Shape.tsx";
import React, {FC, MutableRefObject} from "react";
import {Canvas} from "fabric";
import Photo from "../../Toolkit/Photo/Photo.tsx";
import {ACTION_TYPE} from "../../painter.config.ts";
import { usePainter } from '../../../../context/painter.context.tsx';

interface ActionContentProps {
    canvas: MutableRefObject<Canvas | null>;
}

const ActionContent: FC<ActionContentProps> = ({canvas}) => {

    const { selectedAction, setSelectedAction } = usePainter();

    const handleOnClose = () => setSelectedAction(null);

    return (
    <Box display={selectedAction ? 'block' : 'none'} position="absolute" top={0} left={0} zIndex={10} boxShadow={2} px={2} py={1} minWidth={200} bgcolor={grey[800]} >
        <Stack flexDirection="row" alignItems="center" justifyContent="flex-end">
            <IconButton onClick={handleOnClose}>
                <CloseIcon sx={{ color: grey[100] }} />
            </IconButton>
        </Stack>
        {selectedAction === ACTION_TYPE.DRAW && <Draw canvas={canvas} />}
        {selectedAction === ACTION_TYPE.TEXT && <Text canvas={canvas} onClose={handleOnClose} />}
        {selectedAction === ACTION_TYPE.SHAPE && <Shape canvas={canvas} onClose={handleOnClose} />}
        {selectedAction === ACTION_TYPE.PHOTO && <Photo canvas={canvas} />}
    </Box>
    )
}

export default ActionContent;