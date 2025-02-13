import {CircularProgress, Stack} from "@mui/material";
import Permissions from "../../../../components/Permissions/Permissions.tsx";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import EditIcon from "@mui/icons-material/Edit";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {useAuth} from "../../../../context/auth.context.tsx";
import {queryClient} from "../../../../main.tsx";
import {GET_USERS} from "../../../../api/hooks/user/useGetUsers.ts";
import {GET_USER} from "../../../../api/hooks/user/useGetUser.ts";
import useUpdateUser from "../../../../api/hooks/user/useUpdateUser.ts";
import useRemoveUser from "../../../../api/hooks/user/useRemoveUser.ts";
import DeleteDialog from "../../../../components/DeleteDialog/DeleteDialog.tsx";

const Management  = ({ row }) => {
    const { userId } = useAuth();

    const handleUpdateOnSuccess = () => {
        queryClient.invalidateQueries({queryKey: [GET_USERS]})
        queryClient.invalidateQueries({ queryKey: [GET_USER] });
    }

    const handleUpdateOnError = (error) => {
        let error_msg;
        if (error?.status == 422){
            const field = error?.response?.data?.detail[0].loc[1]
            error_msg = `Invalid ${field}`;
        }
        else error_msg = error?.response?.data?.detail;
        toast.error(error_msg);
    }

    const { update, isPending } = useUpdateUser({ onSuccess: handleUpdateOnSuccess, onError: handleUpdateOnError });

    const handleRemoveOnSuccess = () => {
        queryClient.invalidateQueries({queryKey: [GET_USERS]});
    }

    const handleRemoveOnError = () => {
        toast.error("Delete failed");
    }

    const { remove, isPending: deleteIsPending } = useRemoveUser({ onSuccess: handleRemoveOnSuccess, onError: handleRemoveOnError });

    const navigate = useNavigate();

    const handleBlock = () => {
        if (row.id != userId) update({ id: row.id, payload: { isBlocked: true } })
        else toast.error("You can't block yourself");
    }

    const handleUnBlock = () => {
        update({ id: row.id, payload: { isBlocked: false } })
    }

    const handleDelete = () => {
        if (row.id != userId) remove(row.id);
        else toast.error("You can't delete yourself");
    }

    const isBlock = row.isBlocked;

    return (
        <Permissions roles={["user_management"]}>
            <Stack flexDirection="row" alignItems="center" justifyContent="center">
                {!deleteIsPending && <DeleteDialog name={row.username} handleDelete={handleDelete} />}
                {deleteIsPending && (
                    <CircularProgress size={24} />
                )}
                {!isPending && (
                    <Tooltip title={isBlock ? 'Open Block': 'Block'}>
                        <IconButton onClick={isBlock ? handleUnBlock : handleBlock} disabled={isPending}>
                            {isBlock ? <LockOpenIcon />: <LockPersonIcon />}
                        </IconButton>
                    </Tooltip>
                )}
                {isPending && (
                    <CircularProgress size={24} />
                )}
                <IconButton onClick={() => navigate(`/admin/users/${row.id}`)}>
                    <EditIcon />
                </IconButton>
            </Stack>
        </Permissions>
    )
}

export default Management;