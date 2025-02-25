import {TableHead as MUITableHead} from "@mui/material";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import TableSortLabel from "@mui/material/TableSortLabel";
import Box from "@mui/material/Box";
import {visuallyHidden} from "@mui/utils";
import {ChangeEvent, FC} from "react";
import {HeadCell} from "../../../../types/table.ts";
import {Order} from "../../table.utils.ts";

interface TableHeadProps {
    numSelected: number;
    onRequestSort: (event: MouseEvent, property: string) => void;
    onSelectAllClick: (event: ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
    tableHeader: HeadCell[];
}

const TableHead: FC<TableHeadProps> = ({ onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, tableHeader }) => {

    return (
        <MUITableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{
                            'aria-label': 'select all items',
                        }}
                    />
                </TableCell>
                {tableHeader.map((headCell) => (
                    <TableCell
                        key={`header-${headCell.id}`}
                        align={headCell.align}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={(event) => onRequestSort(event, headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
                <TableCell key='header-management' />
            </TableRow>
        </MUITableHead>
    );
}

export default TableHead;