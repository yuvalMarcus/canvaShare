import Typography from "@mui/material/Typography";
import {FC} from "react";
import Tooltip from "@mui/material/Tooltip";

interface TableCellDefaultProps {
    value: string[];
}

export const TableCellRoles: FC<TableCellDefaultProps> = ({ value }) => {

    return (
        <Tooltip title={value.join(", ")} >
            <Typography maxWidth={200} textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
                {value.join(", ")}
            </Typography>
        </Tooltip>
    )
}