import * as React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

export const TableCellDate = ({value}) => {
    const date = String(new Date(value))
    return (
        <Tooltip title={date}>
            <Box>{value}</Box>
        </Tooltip>
    )
}