import deleteReport from "../../../api/hooks/report/useDeleteReport.ts";
import getReports from '../../../api/hooks/report/useGetReports.ts'
import EnhancedTable from "../../../components/Table/Table.tsx"
import {ReportPayload as report} from '../../../types/report.ts'
import {HeadCell} from '../../../types/table.ts'
import {Box} from "@mui/material";

const tableHeader: HeadCell[] = [
    {id: 'id', align: 'left', disablePadding: true, label: 'ID', type: 'text'},
    {id: 'date', align: 'left', disablePadding: false, label: 'Date', type: 'date'},
    {id: 'type', align: 'left', disablePadding: false, label: 'Type', type: 'text'},
    {id: 'canvasId', align: 'left', disablePadding: false, label: 'Paint ID', type: 'text'},
    {id: 'userId', align: 'left', disablePadding: false, label: 'User ID', type: 'text'},
    {id: 'description', align: 'left', disablePadding: false, label: 'Description', type: 'text'},
];

const ReportsTable = () => {
    const {mutate: deleteMutate, isPending: deleteIsPending} = deleteReport();
    const { data, isPending: getIsPending } = getReports();

    const rows = !getIsPending
        && Array.isArray(data?.reports)
        && data.reports.map(({id, date, type, canvasId, userId, description}: report) => {
        return {id, date, type, canvasId, userId, description}}) || []

    const handleDelete = (id: number) => {
        deleteMutate(id);
    }

    return (
        <Box>
            {(!getIsPending
                && !deleteIsPending
                && !!data)
                && (<EnhancedTable rows={rows}
                                   orderByValue={'id'}
                                   tableHeader={tableHeader}
                                   tableTitle={'Reports'}
                                   handleDelete={handleDelete}
                                   uniqueProperty='id'
                                   nameProperty='id' />
            )}
        </Box>
    )};

export default ReportsTable;