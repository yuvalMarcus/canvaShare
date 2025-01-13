import {TextField} from "@mui/material";
import { usePaint } from "../../../../../context/paint.context.tsx";
import {useParams} from "react-router-dom";
import useGetPaint from "../../../../../api/hooks/paint/useGetPaint.ts";

const Name = () => {

    const { id: paintId } = useParams();

    const { data } = useGetPaint(paintId ? Number(paintId) : undefined);

    const { payload, handleUpload } = usePaint();

    return (
        <TextField id="outlined-basic" label="Name" variant="outlined" size="small" value={payload.name || data?.name || "Untitled Paint"} onChange={event => handleUpload('name', event.target.value)} />
    )
}

export default Name;