import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import {queryClient} from "../../../../main.tsx";
import {toast} from "react-toastify";
import useRemoveReport from "../../../../api/hooks/report/useRemoveReport.ts";
import {GET_REPORTS} from "../../../../api/hooks/report/useGetReports.ts";

const MultiSelect = ({ ids }) => {

    const handleOnSuccess = () => {
        queryClient.invalidateQueries({queryKey: [GET_REPORTS]});
    }

    const handleOnError = () => {
        toast.error("Delete failed");
    }

    const { remove } = useRemoveReport({ onSuccess: handleOnSuccess, onError: handleOnError });

    const handleDelete = async () => {
        await new Promise.all([ids.map((id) => remove(id))])
    }

    return (
        <Permissions roles={["report_management"]}>
            <Tooltip title="Delete">
                <IconButton onClick={handleDelete}>
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
        </Permissions>
    )
}

export default MultiSelect;