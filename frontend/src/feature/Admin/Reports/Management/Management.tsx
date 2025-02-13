import {Stack} from "@mui/material";
import Permissions from "../../../../components/Permissions/Permissions.tsx";
import {queryClient} from "../../../../main.tsx";
import {toast} from "react-toastify";
import {GET_REPORTS} from "../../../../api/hooks/report/useGetReports.ts";
import useRemoveReport from "../../../../api/hooks/report/useRemoveReport.ts";
import DeleteDialog from "../../../../components/DeleteDialog/DeleteDialog.tsx";

const Management  = ({ row }) => {

    const handleOnSuccess = () => {
        queryClient.invalidateQueries({queryKey: [GET_REPORTS]});
    }

    const handleOnError = () => {
        toast.error("Delete failed");
    }

    const { remove } = useRemoveReport({ onSuccess: handleOnSuccess, onError: handleOnError });

    const handleDelete = async () => {
        await remove(row.id);
    }

    return (
        <Permissions roles={["report_management"]}>
            <Stack flexDirection="row" alignItems="center" justifyContent="center">
                <DeleteDialog name={row.name} handleDelete={handleDelete} />
            </Stack>
        </Permissions>
    )
}

export default Management;