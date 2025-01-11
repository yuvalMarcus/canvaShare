import EnhancedTable from "../../components/Table/Table.tsx"
import {Box} from "@mui/material";
import getCanvases from '../../hooks/yarinHooks/useGetCanvases.ts'
import {canvas} from '../../types/yarinTypes/canvas.ts'
import {HeadCell} from  '../../types/yarinTypes/table.ts'

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

const handleDelete = (canvasId: number | string) => {
    console.log('Delete', canvasId)
}

const handleEdit = (canvasId: number | string) => {
    console.log('Edit', canvasId)
}

const CanvasesTable = () => {
    const { data, isPending } = getCanvases();
    const rows = !isPending
        && Array.isArray(data?.canvases)
        && data.canvases.map(({id, username, photo, name, isPublic, likes, createDate, editDate, description}: canvas) => {
        return {id, username, photo, name, isPublic, likes, createDate, editDate, description}}) || []

    return (
        <Box py={8} px={40}>
            {(!isPending && !!data) && (
                <EnhancedTable rows={rows} orderByValue={'id'} tableHeader={tableHeader} tableTitle={'Canvases'}
                               handleDelete={handleDelete} handleEdit={handleEdit} uniqueProperty={'id'}/>
            )}
        </Box>
    )};

export default CanvasesTable;