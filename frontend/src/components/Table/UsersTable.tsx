import EnhancedTable from "../../components/Table/Table.tsx"
import {Box} from "@mui/material";
import getUsers from '../../hooks/yarinHooks/useGetUsers.ts'
import {user} from '../../types/yarinTypes/user.ts'
import {HeadCell} from  '../../types/yarinTypes/table.ts'
import deleteUser from "../../hooks/yarinHooks/useDeleteUser.ts";

const tableHeader: HeadCell[] = [
    {id: 'id', align: 'left', disablePadding: true, label: 'ID', type: 'text'},
    {id: 'username', align: 'left', disablePadding: true, label: 'Username', type: 'text'},
    {id: 'email', align: 'left', disablePadding: false, label: 'Email', type: 'text'},
    {id: 'profilePhoto', align: 'left', disablePadding: false, label: 'Profile Photo', type: 'image'},
    {id: 'coverPhoto', align: 'left', disablePadding: false, label: 'Cover Photo', type: 'image'},
    {id: 'password', align: 'left', disablePadding: false, label: 'Password', type: 'password'},
];


const UsersTable = () => {
    const deleteMutation = deleteUser();
    const { data, isPending } = getUsers();
    const rows =
        !isPending
        && Array.isArray(data)
        && data?.map(({id, username, email, profilePhoto, coverPhoto, password}: user) =>
        {return {id, username, email, profilePhoto, coverPhoto, password}}) || []

    const handleDelete = (id: number) => {
        console.log('Delete', id)
        deleteMutation.mutate(id);
    }

    const handleEdit = (id: number) => {
        console.log('Edit', id)
    }

    return (
        <Box py={8} px={50}>
            {(!isPending && !deleteMutation.isPending && !!data) && (
                <EnhancedTable rows={rows} orderByValue={'username'} tableHeader={tableHeader} tableTitle={'Users'}
                               handleDelete={handleDelete} handleEdit={handleEdit} uniqueProperty={'id'}/>
            )}
        </Box>
    )};

export default UsersTable;