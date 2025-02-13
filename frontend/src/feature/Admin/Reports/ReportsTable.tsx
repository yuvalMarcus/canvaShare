import getReports from '../../../api/hooks/report/useGetReports.ts'
import {ReportPayload as report} from '../../../types/report.ts'
import {HeadCell} from '../../../types/table.ts'
import {Box, CircularProgress} from "@mui/material";
import Table from "../../../components/Table/Table.tsx";
import Management from "../Tags/Management/Management.tsx";
import MultiSelect from "../Tags/MultiSelect/MultiSelect.tsx";

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

    const rows = data.results.map(({id, date, type, paintId, userId, description}: report) => {
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
                <CircularProgress size={24}/>
            )}
        </Box>
    )};

export default ReportsTable;