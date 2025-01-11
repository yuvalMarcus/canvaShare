import EnhancedTable from "../../components/Table/Table.tsx"
import {useQuery} from "@tanstack/react-query";
import * as userApi from '../../api/yarin.ts'
import {Box} from "@mui/material";

const GET_USERS = 'getUsers';

interface HeadCell {
    disablePadding: boolean;
    id: string;
    label: string;
    numeric: boolean;
    type: string;
}

const headCells: HeadCell[] = [
    {id: 'username', numeric: false, disablePadding: true, label: 'Username', type: 'text'},
    {id: 'email', numeric: false, disablePadding: false, label: 'Email', type: 'text'},
    {id: 'profilePhoto', numeric: false, disablePadding: false, label: 'Profile Photo', type: 'image'},
    {id: 'coverPhoto', numeric: false, disablePadding: false, label: 'Cover Photo', type: 'image'},
    {id: 'password', numeric: false, disablePadding: false, label: 'Password', type: 'password'},
];

const handleDelete = (userame) => {
    console.log('Delete', userame)
}

const handleEdit = (userame) => {
    console.log('Edit', userame)
}

const UsersTable = () => {
    const { data, isPending } = useQuery({
        queryKey: [GET_USERS],
        queryFn: () => userApi.getUsers(),
    });

    const rows = !isPending && data?.map(({username, email, profilePhoto, coverPhoto, password}) => {
        return {username, email, profilePhoto, coverPhoto, password}}) || []

    return (
        <Box py={8} px={50}>
            {(!isPending && !!data) && (
                <EnhancedTable rows={rows} orderByValue={'username'} headCells={headCells} tableTitle={'Users'}
                               handleDelete={handleDelete} handleEdit={handleEdit} uniqueProperty={'username'}/>
            )}
        </Box>
    )};

export default UsersTable;