import { TableRow as MUITableRow } from "@mui/material";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import {ReactNode} from "react";
import {HeadCell} from "../../../../types/table.ts";
import {tableCellByType} from "./tableRow.config.tsx";

interface RowProps<T> {
    row: T;
    index: number;
    isItemSelected: boolean;
    handleClick: (id: number) => void;
    tableHeader: HeadCell[];
    children: ReactNode;
}

const TableRow = <T extends unknown>({ row, index, isItemSelected, handleClick, tableHeader, children }: RowProps<T>) => {

    const labelId = `table-checkbox-${index}`;

    return (
        <MUITableRow
            hover
            tabIndex={-1}
            key={`row-${index}`}
            selected={isItemSelected}
            sx={{ cursor: 'pointer' }}
        >
            <TableCell key={`row-${index}-col-0`} padding="checkbox">
                <Checkbox
                    onClick={() => handleClick(row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    color="primary"
                    checked={isItemSelected}
                    inputProps={{
                        'aria-labelledby': labelId,
                    }}
                />
            </TableCell>
            {Object.keys(row).map((param, i) => {

                const Component = tableCellByType[tableHeader[i].type || 'default'] || tableCellByType['default'];

                return (
                    <TableCell key={`row-${index}-col-${i+1}`}  id={labelId} padding={tableHeader[i].type === "id" ? "none": "normal"}>
                        <Component value={row[param]} />
                    </TableCell>
                )
            })}
            <TableCell key={`row-${index}-col-${row.length+1}`} id={labelId}>
                {children}
            </TableCell>
        </MUITableRow>
    )
}

export default TableRow;