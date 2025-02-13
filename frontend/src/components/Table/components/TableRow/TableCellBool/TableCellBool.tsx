import Typography from "@mui/material/Typography";
import {FC} from "react";

interface TableCellBoolProps {
    value: boolean;
}

export const TableCellBool: FC<TableCellBoolProps> = ({ value }) => {
    return (
        <Typography>{value.toString()}</Typography>
    )
}