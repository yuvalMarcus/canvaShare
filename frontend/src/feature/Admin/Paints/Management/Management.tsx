import {Stack} from "@mui/material";
import Permissions from "../../../../components/Permissions/Permissions.tsx";
import {queryClient} from "../../../../main.tsx";
import {GET_TAGS} from "../../../../api/hooks/tag/useGetTags.ts";
import {GET_PAINTS} from "../../../../api/hooks/paint/useGetPaints.ts";
import {toast} from "react-toastify";
import {GET_USERS} from "../../../../api/hooks/user/useGetUsers.ts";
import useRemovePaint from "../../../../api/hooks/paint/useRemovePaint.ts";
import DeleteDialog from "../../../../components/DeleteDialog/DeleteDialog.tsx";
import {GET_INFINITE_PAINTS} from "../../../../api/hooks/paint/useGetInfinitePaints.ts";

const Management  = ({ row }) => {

    const handleOnSuccess = () => {
        queryClient.invalidateQueries({queryKey: [GET_TAGS]});
        queryClient.invalidateQueries({queryKey: [GET_PAINTS]});
        queryClient.invalidateQueries({ queryKey: [GET_INFINITE_PAINTS] });
        queryClient.invalidateQueries({queryKey: [GET_USERS]});
    }

    const handleOnError = () => {
        toast.error("Delete failed");
    }

    const { remove } = useRemovePaint({ onSuccess: handleOnSuccess, onError: handleOnError });

    const handleDelete = async () => {
        await remove(row.id);
    }

    return (
        <Permissions roles={["paint_management"]}>
            <Stack flexDirection="row" alignItems="center" justifyContent="center">
                <DeleteDialog name={row.name} handleDelete={handleDelete} />
            </Stack>
        </Permissions>
    )
}

export default Management;