import {Stack} from "@mui/material";
import Card from "./CanvasItem/CanvasItem.tsx";
import {drawings} from "../../mook.ts";

interface CanvasListProps {
    cardDetails?: boolean;
}

const CanvasList = ({cardDetails}: CanvasListProps) => {
    return (
        <Stack flexDirection="row" gap={2} justifyContent="center" flexWrap="wrap">
            {drawings.map(({id, name, description, photo}) => <Card key={id} details={cardDetails} name={name} description={description} photo={photo} />)}
        </Stack>
    );
}

export default CanvasList;