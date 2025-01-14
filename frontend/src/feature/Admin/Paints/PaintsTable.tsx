import deletePaint from "../../../api/hooks/paint/useDeletePaint.ts";
import getPaints from '../../../api/hooks/paint/useGetPaints.ts'
import EnhancedTable from "../../../components/Table/Table.tsx"
import {paintTable as paint} from '../../../types/paint.ts'
import {HeadCell} from '../../../types/table.ts'
import {Box} from "@mui/material";

const tableHeader: HeadCell[] = [
    {id: 'id', align: 'left', disablePadding: true, label: 'ID', type: 'text'},
    {id: 'username', align: 'left', disablePadding: false, label: 'Username', type: 'text'},
    {id: 'photo', align: 'left', disablePadding: false, label: 'Photo', type: 'image'},
    {id: 'name', align: 'left', disablePadding: false, label: 'Name', type: 'text'},
    {id: 'isPublic', align: 'left', disablePadding: false, label: 'is Public', type: 'bool'},
    {id: 'likes', align: 'left', disablePadding: false, label: 'Likes', type: 'text'},
    {id: 'createDate', align: 'left', disablePadding: false, label: 'Create Date', type: 'date'},
    {id: 'editDate', align: 'left', disablePadding: false, label: 'Edit Date', type: 'date'},
    {id: 'description', align: 'left', disablePadding: false, label: 'Description', type: 'text'},
];

const PaintsTable = () => {
    const {mutate: deleteMutate, isPending: deleteIsPending} = deletePaint();
    const { data, isPending: getIsPending } = getPaints();

    const rows = !getIsPending
        && Array.isArray(data?.results)
        && data.results.map(({id, username, photo, name, isPublic, likes, createDate, editDate, description}: paint) => {
        return {id, username, photo, name, isPublic, likes, createDate, editDate, description}}) || []

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
                                   tableTitle={'Paints'}
                                   handleDelete={handleDelete}
                                   uniqueProperty='id'
                                   nameProperty='name' />
            )}
        </Box>
    )};

export default PaintsTable;