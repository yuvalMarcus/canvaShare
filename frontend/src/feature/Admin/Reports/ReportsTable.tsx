import getReports from '../../../api/hooks/report/useGetReports.ts'
import {HeadCell} from '../../../types/table.ts'
import {Box, CircularProgress, Stack} from "@mui/material";
import Table from "../../../components/Table/Table.tsx";
import Management from "../Reports/Management/Management.tsx";
import MultiSelect from "../Reports/MultiSelect/MultiSelect.tsx";

const tableHeader: HeadCell[] = [
    {id: 'id', align: 'left', disablePadding: true, label: 'ID', type: 'text'},
    {id: 'date', align: 'left', disablePadding: false, label: 'Date', type: 'date'},
    {id: 'type', align: 'left', disablePadding: false, label: 'Type', type: 'text'},
    {id: 'paintId', align: 'left', disablePadding: false, label: 'Paint ID', type: 'text'},
    {id: 'userId', align: 'left', disablePadding: false, label: 'User ID', type: 'text'},
    {id: 'description', align: 'left', disablePadding: false, label: 'Description', type: 'text'},
];

const ReportsTable = () => {
    const { data, isPending } = getReports();

    const rows = data?.results?.map(({id, date, type, paintId, userId, description}) => {
        return {id, date, type, paintId, userId, description}}) || []

    return (
        <Box>
            {!isPending &&
                <Table
                    <{ id: number, value: string }>
                    rows={rows}
                    orderByValue='id'
                    tableHeader={tableHeader}
                    tableTitle='Reports'
                    Management={Management}
                    MultiSelect={MultiSelect}
                />}
            {isPending && (
                <Stack alignItems="center" justifyContent="center" minHeight={200}>
                    <CircularProgress size={36}/>
                </Stack>
            )}
        </Box>
    )};

export default ReportsTable;