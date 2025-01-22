import deleteTag from "../../../api/hooks/tag/useDeleteTag.ts";
import getTags from '../../../api/hooks/tag/useGetTags.ts';
import {HeadCell} from '../../../types/table.ts';
import {Box} from "@mui/material";
import EnhancedTable from "../../../components/Table2/EnhancedTable/EnhancedTable.tsx";

const tableHeader: HeadCell[] = [
    {id: 'id', align: 'left', disablePadding: true, label: 'ID', type: 'text'},
    {id: 'name', align: 'left', disablePadding: false, label: 'Name', type: 'text'}
];

const TagsTable = () => {
    const {mutate: deleteMutate, isPending: deleteIsPending} = deleteTag();
    const { data, isPending: getIsPending } = getTags();

    const handleDelete = (id: number) => {
        deleteMutate(id);
    }

    return (
        <Box>
            <EnhancedTable rows={data?.tags || []}
                           orderByValue={'id'}
                           tableHeader={tableHeader}
                           tableTitle={'Tags'}
                           handleDelete={handleDelete}
                           uniqueProperty='id'
                           nameProperty='name' />
        </Box>
    )};

export default TagsTable;