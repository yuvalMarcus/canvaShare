import React, {FC, MutableRefObject} from "react";
import {Box, Stack} from "@mui/material";
import {grey} from "@mui/material/colors";
import Button from "@mui/material/Button";
import {useNavigate} from "react-router-dom";
import File from "./File/File.tsx";
import Tags from "./Tags/Tags.tsx";
import PhotoIcon from '@mui/icons-material/Photo';
import Typography from "@mui/material/Typography";
import {TOOL_BAR_HEIGHT} from "../../Paint.tsx";
import Properties from "./Properties/Properties.tsx";
import Name from "./Name/Name.tsx";
import {Canvas} from "fabric";

interface ToolBarProps {
    canvas: MutableRefObject<Canvas | null>;
}

const ToolBar: FC<ToolBarProps> = ({ canvas }) => {

    const navigate = useNavigate();

    return (
        <Stack justifyContent="center" height={TOOL_BAR_HEIGHT} borderBottom={1} borderColor={grey[400]} p={1} gap={1} boxSizing="border-box" sx={{ backgroundColor: grey[100] }}>
            <Stack flexDirection="row" alignItems="center" justifyContent="space-between" >
                <Stack flexDirection="row" alignItems="center" gap={1}>
                    <PhotoIcon fontSize="large" color="primary" />
                    <Name />
                </Stack>
                <Box>
                    <Button size="large" variant="text" onClick={() => navigate(-1)}>
                        <Typography color={grey[900]} textTransform="capitalize">close</Typography>
                    </Button>
                </Box>
            </Stack>
            <Stack flexDirection="row" gap={1}>
                <File canvas={canvas} />
                <Tags />
                <Properties />
            </Stack>
        </Stack>
    )
}

export default ToolBar;