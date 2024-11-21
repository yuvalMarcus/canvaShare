import React from "react";
import {Box, Stack} from "@mui/material";
import {grey} from "@mui/material/colors";
import Button from "@mui/material/Button";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import CloseIcon from "@mui/icons-material/Close";
import Brushes from "../Brushes/Brushes.tsx";

const ToolkitBox = () => {
    return (
        <Box position="absolute" top={0} left={0} zIndex={10} boxShadow={2} px={2} py={1} sx={{ backgroundColor: grey[100]}}>
            <Stack flexDirection="row" justifyContent="space-between" mb={2}>
                <Button sx={{ minWidth: 0, border: 1, borderColor: grey[500], p: 0.5 }}>
                    <CenterFocusStrongIcon sx={{ color: grey[900] }} />
                </Button>
                <Button sx={{ minWidth: 0, border: 1, borderColor: grey[500], p: 0.5 }}>
                    <CloseIcon sx={{ color: grey[900] }} />
                </Button>
            </Stack>
            <Brushes />
        </Box>
    )
}

export default ToolkitBox;