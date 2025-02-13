import getUsers from '../../../api/hooks/user/useGetUsers.ts'
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {userTable as user} from '../../../types/user.ts'
import {HeadCell} from '../../../types/table.ts'
import {Box, CircularProgress, Stack} from "@mui/material";
import {useNavigate} from "react-router-dom";
import Permissions from "../../../components/Permissions/Permissions.tsx";
import Table from "../../../components/Table/Table.tsx";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Management from "./Management/Management.tsx";
import MultiSelect from "./MultiSelect/MultiSelect.tsx";

const tableHeader: HeadCell[] = [
    {id: 'id', align: 'left', disablePadding: true, label: 'ID', type: 'text'},
    {id: 'username', align: 'left', disablePadding: true, label: 'Username', type: 'text'},
    {id: 'email', align: 'left', disablePadding: false, label: 'Email', type: 'text'},
    {id: 'profilePhoto', align: 'left', disablePadding: false, label: 'Profile Photo', type: 'image'},
    {id: 'coverPhoto', align: 'left', disablePadding: false, label: 'Cover Photo', type: 'image'},
    {id: 'roles', align: 'left', disablePadding: false, label: 'Roles', type: 'long-text'},
];

const UsersTable = () => {
    const { data, isPending } = getUsers({});

    const navigate = useNavigate();

    const rows = data?.results?.map(({id, username, email, profilePhoto, coverPhoto, roles}: user) => ({id, username, email, profilePhoto, coverPhoto, roles})) ?? [];

    return (
        <Stack gap={4}>
            <Permissions roles={[]}>
                <Box>
                    <Button variant="contained" onClick={() => navigate('/admin/users/create')}>
                        <PersonAddIcon fontSize={'large'} />
                        <Typography ml={2}>add new user</Typography>
                    </Button>
                </Box>
            </Permissions>
            {!isPending &&
                <Table
                    <{ id: number, value: string }>
                    rows={rows}
                    orderByValue='id'
                    tableHeader={tableHeader}
                    tableTitle='Users'
                    Management={Management}
                    MultiSelect={MultiSelect}
                />}
            {isPending && (
                <CircularProgress size={24}/>
            )}
        </Stack>
    )
};

export default UsersTable;