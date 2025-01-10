import {TextField} from "@mui/material";
import React from "react";
import { usePainter } from "../../../../../context/painter.context.tsx";
import {useParams} from "react-router-dom";
import useGetPainter from "../../../../../api/hooks/useGetPainter.ts";

const Name = () => {

    const { id: painterId } = useParams();

    const { data } = useGetPainter(painterId ? Number(painterId) : undefined);

    const { payload, handleUpload } = usePainter();

    return (
        <TextField id="outlined-basic" label="Name" variant="outlined" size="small" value={payload.name || data?.name || "Untitled Canvas"} onChange={event => handleUpload('name', event.target.value)} />
    )
}

export default Name;