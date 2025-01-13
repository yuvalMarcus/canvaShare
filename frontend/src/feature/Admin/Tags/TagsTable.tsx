import deleteTag from "../../../api/hooks/tag/useDeleteTag.ts";
import getTags from '../../../api/hooks/tag/useGetTags.ts';
import EnhancedTable from "../../../components/Table/Table.tsx";
import {TagPayload as tag} from '../../../types/tags.ts';
import {HeadCell} from '../../../types/table.ts';
import {Box} from "@mui/material";

const tableHeader: HeadCell[] = [
    {id: 'id', align: 'left', disablePadding: true, label: 'ID', type: 'text'},
    {id: 'name', align: 'left', disablePadding: false, label: 'Name', type: 'text'}
];

const TagsTable = () => {
    const {mutate: deleteMutate, isPending: deleteIsPending} = deleteTag();
    const { data, isPending: getIsPending } = getTags();

    const rows = !getIsPending
        && Array.isArray(data?.tags)
        && data.tags.map(({id, name}: tag) => {
        return {id, name}}) || []

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
                                   tableTitle={'Tags'}
                                   handleDelete={handleDelete}
                                   uniqueProperty='id'
                                   nameProperty='name' />
            )}
        </Box>
    )};

export default TagsTable;