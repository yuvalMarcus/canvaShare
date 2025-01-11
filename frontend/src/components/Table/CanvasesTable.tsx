import EnhancedTable from "../../components/Table/Table.tsx"
import {useQuery} from "@tanstack/react-query";
import * as canvasApi from "../../api/painter.ts";
import {Box} from "@mui/material";

const GET_CANVASES = 'getCanvas';

interface HeadCell {
    disablePadding: boolean;
    id: string;
    label: string;
    numeric: boolean;
    type: string;
}

const headCells: HeadCell[] = [
    {id: 'id', numeric: true, disablePadding: true, label: 'ID', type: 'text'},
    {id: 'username', numeric: false, disablePadding: false, label: 'Username', type: 'text'},
    {id: 'photo', numeric: false, disablePadding: false, label: 'Photo', type: 'image'},
    {id: 'name', numeric: false, disablePadding: false, label: 'Name', type: 'text'},
    {id: 'isPublic', numeric: false, disablePadding: false, label: 'is Public', type: 'bool'},
    {id: 'likes', numeric: false, disablePadding: false, label: 'Likes', type: 'text'},
    {id: 'createDate', numeric: false, disablePadding: false, label: 'Create Date', type: 'date'},
    {id: 'editDate', numeric: false, disablePadding: false, label: 'Edit Date', type: 'date'},
    {id: 'description', numeric: false, disablePadding: false, label: 'Description', type: 'text'},
];

const handleDelete = (canvasId) => {
    console.log('Delete', canvasId)
}

const handleEdit = (canvasId) => {
    console.log('Edit', canvasId)
}

const CanvasesTable = () => {
    const { data, isPending } = useQuery({
        queryKey: [GET_CANVASES],
        queryFn: () => canvasApi.getPainters({}),
    });

    const rows = !isPending && data?.canvases?.map(({id, username, photo, name, isPublic, likes, createDate, editDate, description}) => {
        return {id, username, photo, name, isPublic, likes, createDate, editDate, description}}) || []

    return (
        <Box py={8} px={40}>
            {(!isPending && !!data) && (
                <EnhancedTable rows={rows} orderByValue={'id'} headCells={headCells} tableTitle={'Canvases'}
                               handleDelete={handleDelete} handleEdit={handleEdit} uniqueProperty={'id'}/>
            )}
        </Box>
    )};

export default CanvasesTable;