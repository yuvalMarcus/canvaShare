import deleteUser from "../../../api/hooks/user/useDeleteUser.ts";
import updateUser from "../../../api/hooks/user/useUpdateUser.ts";
import getUsers from '../../../api/hooks/user/useGetUsers.ts'
import EnhancedTable from "../../../components/Table/Table.tsx"
import AddBoxIcon from '@mui/icons-material/AddBox';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import {userTable as user} from '../../../types/user.ts'
import {HeadCell} from '../../../types/table.ts'
import {Box, Stack} from "@mui/material";
import {useState} from "react";
import UserForm from "./UserForm.tsx";

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
    const {mutate: updateMutate, isPending: updateIsPending} = updateUser();
    const { data, isPending: getIsPending } = getUsers({});
    const [userFrom, setUserForm] = useState(false);
    const [userIdEdit, setUserIdEdit] = useState(0)

    const rows =
        !getIsPending
        && Array.isArray(data)
        && data?.map(({id, username, email, profilePhoto, coverPhoto, password, isBlocked}: user) =>
        {return {id, username, email, profilePhoto, coverPhoto, password, isBlocked}}) || []

    const handleBlock = (id: number) => {
        updateMutate({ id: id, payload: {isBlocked: true} })
    }

    const handleUnBlock = (id: number) => {
        updateMutate({ id: id, payload: {isBlocked: false} })
    }

    const handleEdit = (id: number) => {
        setUserIdEdit(id)
        setUserForm(true)
    }

    return (
        <Box>
            {(!getIsPending
                && !deleteIsPending
                && !updateIsPending
                && !!data)
                && (userFrom
                    && (<>
                        <Stack flexDirection="row" alignItems='center' onClick={() => {setUserForm(!userFrom); setUserIdEdit(0)}}>
                            <ArrowBackOutlinedIcon fontSize={'large'} />
                            <Box pl={1}>Return</Box>
                        </Stack>
                        <UserForm userId={userIdEdit}/>
                        </>)
                    ||(<>
                        <Stack flexDirection="row" alignItems='center' pb={2} onClick={() => {setUserForm(!userFrom); setUserIdEdit(0)}}>
                            <AddBoxIcon fontSize={'large'} />
                            <Box pl={1}>Add new user</Box>
                        </Stack>
                        <EnhancedTable rows={rows}
                                       orderByValue={'username'}
                                       tableHeader={tableHeader}
                                       tableTitle={'Users'}
                                       handleDelete={(id: number) => {
                                           deleteMutate(id);}}
                                       handleUpdate={handleEdit}
                                       handleBlock={handleBlock}
                                       handleUnBlock={handleUnBlock}
                                       uniqueProperty='id'
                                       nameProperty='username'/>
                        </>)
            )}
        </Box>
    )
};

export default UsersTable;