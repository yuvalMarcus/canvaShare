import deleteUser from "../../../api/hooks/user/useDeleteUser.ts";
import createUser from "../../../api/hooks/user/useCreateUser.ts";
import updateUser from "../../../api/hooks/user/useUpdateUser.ts";
import getUsers from '../../../api/hooks/user/useGetUsers.ts'
import EnhancedTable from "../../../components/Table/Table.tsx"
import {UserPayload, userTable as user} from '../../../types/user.ts'
import {HeadCell} from '../../../types/table.ts'
import {Box} from "@mui/material";

const tableHeader: HeadCell[] = [
    {id: 'id', align: 'left', disablePadding: true, label: 'ID', type: 'text'},
    {id: 'username', align: 'left', disablePadding: true, label: 'Username', type: 'text'},
    {id: 'email', align: 'left', disablePadding: false, label: 'Email', type: 'text'},
    {id: 'profilePhoto', align: 'left', disablePadding: false, label: 'Profile Photo', type: 'image'},
    {id: 'coverPhoto', align: 'left', disablePadding: false, label: 'Cover Photo', type: 'image'},
    {id: 'password', align: 'left', disablePadding: false, label: 'Password', type: 'password'},
];

const UsersTable = () => {
    const {mutate: deleteMutate, isPending: deleteIsPending} = deleteUser();
    const {mutate: createMutate, isPending: createIsPending} = createUser();
    const {mutate: updateMutate, isPending: updateIsPending} = updateUser();
    const { data, isPending: getIsPending } = getUsers();

    const rows =
        !getIsPending
        && Array.isArray(data)
        && data?.map(({id, username, email, profilePhoto, coverPhoto, password}: user) =>
        {return {id, username, email, profilePhoto, coverPhoto, password}}) || []

    const handleCreate = (payload: UserPayload) => {
        createMutate(payload);
    }

    return (
        <Box>
            {(!getIsPending
                && !deleteIsPending
                && !createIsPending
                && !updateIsPending
                && !!data)
                && (<EnhancedTable rows={rows}
                                   orderByValue={'username'}
                                   tableHeader={tableHeader}
                                   tableTitle={'Users'}
                                   handleDelete={(id: number) => {
                                       deleteMutate(id);}}
                                   handleUpdate={(id: number, payload: UserPayload) => {
                                       updateMutate({ id: id, payload })}}
                                   uniqueProperty='id'
                                   nameProperty='username'/>
            )}
        </Box>
    )};

export default UsersTable;