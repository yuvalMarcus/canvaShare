import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import {FC} from "react";

interface TableCellDateProps {
    value: number;
}

export const TableCellDate: FC<TableCellDateProps> = ({ value }) => {

    return (
        <Tooltip title={new Date(value * 1000).toLocaleDateString("en-US")}>
            <Box>{new Date(value * 1000).toLocaleDateString("en-US")}</Box>
        </Tooltip>
    )
}