import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import {Table as MUITable} from "@mui/material";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";
import {ChangeEvent, ReactNode, useLayoutEffect, useMemo, useState} from "react";
import TableHead from "./components/TableHead/TableHead.tsx";
import {HeadCell} from "../../types/table.ts";
import {getComparator, Order} from "./table.utils.ts";
import TableToolbar from "./components/TableToolbar/TableToolbar.tsx";
import TableRow from "./components/TableRow/TableRow.tsx";
import Management from "../../feature/Admin/Tags/Management/Management.tsx";

interface TableProps<T> {
    rows: T[];
    orderByValue: string;
    tableHeader: HeadCell[];
    tableTitle: string;
    Management: ({row, index}: {row: any, index: number}) => ReactNode;
    MultiSelect?: ({ ids }: {ids: number[]}) => ReactNode;
}

const Table = <T extends unknown>({
                                      rows,
                                      orderByValue,
                                      tableHeader,
                                      tableTitle,
                                      Management,
                                      MultiSelect}: TableProps<T>) => {
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<string>(orderByValue);
    const [selected, setSelected] = useState<number[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const visibleRows = useMemo(
        () =>
            [...rows]
                .sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [rows, order, orderBy, page, rowsPerPage],
    );

    const handleRequestSort = (event: MouseEvent, property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = rows.map((n) => n.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (id: number) => {
        const selectedIndex = selected.indexOf(id);

        if(selectedIndex === -1) {
            setSelected([...selected, id]);
            return;
        }

        setSelected([...selected.slice(0, selectedIndex), ...selected.slice(selectedIndex + 1)]);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    useLayoutEffect(() => {
        const ids = rows.map(({id}) => id);
        setSelected(selected.filter((id) => ids.includes(id)));
    }, [rows]);

    return (
        <Box>
            <Paper>
                <TableToolbar selected={selected} tableTitle={tableTitle} MultiSelect={MultiSelect} />
                <TableContainer>
                    <MUITable>
                        <TableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                            tableHeader={tableHeader}
                        />
                        <TableBody>
                            {visibleRows.map((row, index) => <TableRow
                                <T>
                                key={row.id}
                                row={row}
                                index={index}
                                isItemSelected={selected.includes(row.id)}
                                tableHeader={tableHeader}
                                handleClick={handleClick}>
                                <Management row={row} index={index} />
                            </TableRow>)}
                        </TableBody>
                    </MUITable>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, page) => setPage(page)}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}

export default Table;