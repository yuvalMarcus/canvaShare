import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import {queryClient} from "../../../../main.tsx";
import {toast} from "react-toastify";
import useRemoveUser from "../../../../api/hooks/user/useRemoveUser.ts";
import {GET_USERS} from "../../../../api/hooks/user/useGetUsers.ts";
import Permissions from "../../../../components/Permissions/Permissions.tsx";

const MultiSelect = ({ ids }) => {

    const handleOnSuccess = () => {
        queryClient.invalidateQueries({queryKey: [GET_USERS]});
    }

    const handleOnError = () => {
        toast.error("Delete failed");
    }

    const { remove } = useRemoveUser({ onSuccess: handleOnSuccess, onError: handleOnError });

    const handleDelete = () => {
        new Promise.all([ids.map((id) => remove(id))])
    }

    return (
        <Permissions roles={["user_management"]}>
            <Tooltip title="Delete">
                <IconButton onClick={handleDelete}>
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
        </Permissions>
    )
}

export default MultiSelect;