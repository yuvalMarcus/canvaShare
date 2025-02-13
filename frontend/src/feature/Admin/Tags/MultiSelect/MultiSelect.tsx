import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import {queryClient} from "../../../../main.tsx";
import {toast} from "react-toastify";
import useRemoveTag from "../../../../api/hooks/tag/useRemoveTag.ts";
import {GET_TAGS} from "../../../../api/hooks/tag/useGetTags.ts";
import {GET_PAINTS} from "../../../../api/hooks/paint/useGetPaints.ts";
import {GET_INFINITE_PAINTS} from "../../../../api/hooks/paint/useGetInfinitePaints.ts";

const MultiSelect = ({ ids }) => {

    const handleOnSuccess = () => {
        queryClient.invalidateQueries({queryKey: [GET_TAGS]});
        queryClient.invalidateQueries({queryKey: [GET_PAINTS]});
        queryClient.invalidateQueries({ queryKey: [GET_INFINITE_PAINTS] });
    }

    const handleOnError = () => {
        toast.error("Delete failed");
    }

    const { remove } = useRemoveTag({ onSuccess: handleOnSuccess, onError: handleOnError });

    const handleDelete = async () => {
        await new Promise.all([ids.map((id) => remove(id))])
    }

    return (
        <Permissions roles={["tag_management"]}>
            <Tooltip title="Delete">
                <IconButton onClick={handleDelete}>
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
        </Permissions>
    )
}

export default MultiSelect;