import getPaints from '../../../api/hooks/paint/useGetPaints.ts'
import {HeadCell} from '../../../types/table.ts'
import {Box, CircularProgress} from "@mui/material";
import Table from "../../../components/Table/Table.tsx";
import Management from "../Tags/Management/Management.tsx";
import MultiSelect from "../Users/MultiSelect/MultiSelect.tsx";

const tableHeader: HeadCell[] = [
    {id: 'id', align: 'left', disablePadding: true, label: 'ID', type: 'text'},
    {id: 'username', align: 'left', disablePadding: false, label: 'Username', type: 'text'},
    {id: 'photo', align: 'left', disablePadding: false, label: 'Photo', type: 'image'},
    {id: 'name', align: 'left', disablePadding: false, label: 'Name', type: 'text'},
    {id: 'draft', align: 'left', disablePadding: false, label: 'Draft', type: 'bool'},
    {id: 'likes', align: 'left', disablePadding: false, label: 'Likes', type: 'text'},
    {id: 'createDate', align: 'left', disablePadding: false, label: 'Create Date', type: 'date'},
    {id: 'editDate', align: 'left', disablePadding: false, label: 'Edit Date', type: 'date'},
    {id: 'description', align: 'left', disablePadding: false, label: 'Description', type: 'text'},
];

const PaintsTable = () => {
    const { data, isPending } = getPaints();

    const rows = data?.results?.map(({id, username, photo, name, isPublic, likes, createDate, editDate, description}) => (
            {id, username, photo, name, draft: !isPublic, likes, createDate, editDate, description}
        )) || [];

    return (
        <Box>
            {!isPending &&
                <Table
                    <{ id: number, username: string, photo: string, name: string, description: string, draft: boolean, likes: number, createDate: number, editDate: number }>
                    rows={rows}
                    orderByValue='id'
                    tableHeader={tableHeader}
                    tableTitle='Paints'
                    Management={Management}
                    MultiSelect={MultiSelect}
                />
            }
            {isPending && (
                <CircularProgress size={24}/>
            )}
        </Box>
    )
}
export default PaintsTable;