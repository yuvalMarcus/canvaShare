import {ACTION_TYPE, mapActionToIcon} from "../../../painter.config.ts";
import Button from "@mui/material/Button";
import {blue, grey} from "@mui/material/colors";
import Typography from "@mui/material/Typography";
import React, {FC} from "react";
import {Stack} from "@mui/material";
import {usePainter} from "../../../../../hooks/usePainter.ts";

interface ItemProps {
    action: ACTION_TYPE;
}

const Item: FC<ItemProps> = ({ action }) => {

    const { selectedAction, setSelectedAction } = usePainter();

    const Icon = mapActionToIcon[action];

    return (
        <Button onClick={() => setSelectedAction(action)}>
            <Stack flexDirection="column" alignItems="center" gap={0.5}>
                <Icon fontSize={'large'} sx={{ color: selectedAction === action ? blue[300] : grey[100] }} />
                <Typography textTransform="capitalize" color={selectedAction === action ? blue[300] : grey[100]}>{action}</Typography>
            </Stack>
        </Button>
    )
}

export default Item;