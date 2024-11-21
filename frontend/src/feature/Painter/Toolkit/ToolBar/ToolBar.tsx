import React from "react";
import {Stack} from "@mui/material";
import {grey} from "@mui/material/colors";
import Button from "@mui/material/Button";
import {useNavigate} from "react-router-dom";

const ToolBar = () => {

    const navigate = useNavigate();

    return (
        <Stack flexDirection="row" alignItems="center" height={50} boxShadow={3} borderBottom={2} boxSizing="border-box" sx={{ backgroundColor: grey[900] }}>
            <Button size="large" sx={{ color: grey[100], textTransform: "capitalize" }}>File</Button>
            <Button size="large" sx={{ color: grey[100], textTransform: "capitalize" }} onClick={() => navigate("/")}>Close</Button>
        </Stack>
    )
}

export default ToolBar;