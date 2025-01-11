import {TextField} from "@mui/material";
import { useCanvas } from "../../../../../context/canvas.context.tsx";
import {useParams} from "react-router-dom";
import useGetCanvas from "../../../../../api/hooks/canvas/useGetCanvas.ts";

const Name = () => {

    const { id: canvasId } = useParams();

    const { data } = useGetCanvas(canvasId ? Number(canvasId) : undefined);

    const { payload, handleUpload } = useCanvas();

    return (
        <TextField id="outlined-basic" label="Name" variant="outlined" size="small" value={payload.name || data?.name || "Untitled Paint"} onChange={event => handleUpload('name', event.target.value)} />
    )
}

export default Name;