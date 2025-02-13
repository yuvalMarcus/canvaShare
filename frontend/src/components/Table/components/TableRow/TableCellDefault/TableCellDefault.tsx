import Typography from "@mui/material/Typography";
import {FC} from "react";

interface TableCellDefaultProps {
    value: string;
}

export const TableCellDefault: FC<TableCellDefaultProps> = ({ value }) => {
    return (
        <Typography>
            {value}
        </Typography>
    )
}