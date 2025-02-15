import getTags from '../../../api/hooks/tag/useGetTags.ts';
import {HeadCell} from '../../../types/table.ts';
import {Box, CircularProgress, Stack} from "@mui/material";
import Table from "../../../components/Table/Table.tsx";
import Management from "./Management/Management.tsx";
import MultiSelect from "./MultiSelect/MultiSelect.tsx";

const tableHeader: HeadCell[] = [
    {id: 'id', align: 'left', disablePadding: true, label: 'ID', type: 'text'},
    {id: 'name', align: 'left', disablePadding: false, label: 'Name', type: 'text'}
];

const TagsTable = () => {
    const { data, isPending } = getTags();

    return (
        <Box>
            {!isPending &&
                <Table
                    <{ id: number, value: string }>
                    rows={data?.results ?? []}
                    orderByValue='id'
                    tableHeader={tableHeader}
                    tableTitle='Tags'
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

export default TagsTable;