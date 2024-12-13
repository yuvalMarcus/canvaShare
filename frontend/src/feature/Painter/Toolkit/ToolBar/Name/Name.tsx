import {TextField} from "@mui/material";
import React from "react";
import {useCanvas} from "../../../../../context/canvas.context.tsx";

const Name = () => {

    const { canvas: { name }, handleUpload } = useCanvas();

    return (
        <TextField id="outlined-basic" label="Name" variant="outlined" size="small" value={name} onChange={event => handleUpload('name', event.target.value)} />
    )
}

export default Name;