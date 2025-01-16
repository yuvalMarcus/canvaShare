import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DeleteDialog from '../Table/DeleteDialog.tsx'
import { visuallyHidden } from '@mui/utils';
import ImageModal from '../ImageModal/ImageModal.tsx'
import LockPersonIcon from '@mui/icons-material/LockPerson';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import {HeadCell} from '../../types/table.ts'

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(order: Order, orderBy: Key,): (
    a: { [key in Key]: number | string },
    b: { [key in Key]: number | string },
) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

interface EnhancedTableHeadProps {
    numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
    tableHeader: HeadCell[];
}

function EnhancedTableHead(props: EnhancedTableHeadProps) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, tableHeader } =
        props;
    const createSortHandler =
        (property: string) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
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
                            onClick={createSortHandler(headCell.id)}
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
                <TableCell
                    key='header-management'
                ></TableCell>
            </TableRow>
        </TableHead>
    );
}
interface EnhancedTableToolbarProps {
    numSelected: number;
    tableTitle: string;
}
function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
    const { numSelected, tableTitle } = props;
    return (
        <Toolbar
            sx={[
                {
                    pl: { sm: 2 },
                    pr: { xs: 1, sm: 1 },
                },
                numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                },
            ]}
        >
            {numSelected > 0 ? (
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    variant="h6"
                    id="tableTitle"
                    component="div"
                >
                    {tableTitle}
                </Typography>
            )}
            {numSelected > 0 && (
                <Tooltip title="Delete">
                    <IconButton>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Toolbar>
    );
}

interface EnhancedTableProps {
    rows: any[];
    orderByValue: string;
    tableHeader: HeadCell[];
    tableTitle: string;
    handleDelete: (id: number) => void
    handleUpdate?: (id: number) => void
    handleBlock?: (id: number) => void
    handleUnBlock?: (id: number) => void
    uniqueProperty: string;
    nameProperty: string;
}

const EnhancedTable = ({rows, orderByValue, tableHeader,
                           tableTitle, handleDelete, handleUpdate, handleBlock, handleUnBlock, uniqueProperty,
                           nameProperty}: EnhancedTableProps) => {
    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<string>(orderByValue);
    const [selected, setSelected] = React.useState<readonly number[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleRequestSort = (
        _event: React.MouseEvent<unknown>,
        property: string,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = rows.map((n) => n.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (_event: React.MouseEvent<unknown>, id: number) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: readonly number[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const visibleRows = React.useMemo(
        () =>
            [...rows]
                .sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [order, orderBy, page, rowsPerPage],
    );

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <EnhancedTableToolbar numSelected={selected.length} tableTitle={tableTitle} />
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size='medium'
                    >
                        <EnhancedTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                            tableHeader={tableHeader}
                        />
                        <TableBody>
                            {visibleRows.map((row, index) => {
                                const isItemSelected = selected.includes(row[uniqueProperty]);
                                const labelId = `enhanced-table-checkbox-${index}`;
                                return (
                                    <TableRow
                                        hover
                                        tabIndex={-1}
                                        key={`row-${index}`}
                                        selected={isItemSelected}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell key={`row-${index}-col-0`} padding="checkbox">
                                            <Checkbox
                                                onClick={(event) => handleClick(event, row[uniqueProperty])}
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
                                            if (i >= tableHeader.length)
                                                return
                                            if (i === 0)
                                                return (<TableCell key={`row-${index}-col-${i+1}`} component="th" id={labelId} scope="row" padding="none">
                                                    {row[param]}
                                                </TableCell>)
                                            else if (tableHeader[i].type == 'password')
                                                return (<TableCell key={`row-${index}-col-${i+1}`} align='left'>
                                                    <TextField
                                                        disabled
                                                        id="outlined-password-input"
                                                        label="Password"
                                                        type="password"
                                                        defaultValue="************"
                                                        size="small"
                                                        sx={{ width: '15ch' }}
                                                    /></TableCell>)
                                            else if (tableHeader[i].type == 'image')
                                                return (<TableCell key={`row-${index}-col-${i+1}`} align='left'>
                                                            <ImageModal link={row[param]}/>
                                                        </TableCell>)
                                            else if (tableHeader[i].type == 'bool')
                                                return (<TableCell key={`row-${index}-col-${i+1}`} align='left'>{String(row[param])}</TableCell>)

                                            else if (tableHeader[i].type == 'date'){
                                                const date = String(new Date(row[param]*1000))
                                                return (<TableCell key={`row-${index}-col-${i+1}`} align='left'>
                                                    <Tooltip title={date}>
                                                        <Box>{row[param]}</Box>
                                                    </Tooltip></TableCell>)}
                                            else
                                                return (<TableCell key={`row-${index}-col-${i+1}`}
                                                    align={tableHeader[i].align}>{row[param]}</TableCell>)
                                        })}
                                        <TableCell key={`row-${index}-col-management`} align='right'>
                                            {!row['isBlocked'] && handleBlock && (
                                                <Tooltip title='Block'>
                                                    <IconButton onClick={() => handleBlock(row[uniqueProperty])}>
                                                        <LockPersonIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {row['isBlocked'] && handleUnBlock && (
                                                <Tooltip title='UnBlock'>
                                                    <IconButton onClick={() => handleUnBlock(row[uniqueProperty])}>
                                                        <LockOpenIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {handleUpdate && (
                                            <IconButton onClick={() => handleUpdate(row[uniqueProperty])}>
                                                <EditIcon />
                                            </IconButton>)}
                                            <DeleteDialog id={row[uniqueProperty]} name={row[nameProperty]} handleDelete={handleDelete}/>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: 53 * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}

export default EnhancedTable;