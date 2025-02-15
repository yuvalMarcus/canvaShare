import TableCell from "@mui/material/TableCell";
import {Stack, TableRow as MUITableRow} from "@mui/material";
import Typography from "@mui/material/Typography";

const EmptyData = () => (
    <MUITableRow>
        <TableCell colSpan={100}>
            <Stack width="100%" alignItems="center" justifyContent="center" p={2}>
                <Typography fontSize={18} textTransform="capitalize">no data found.</Typography>
            </Stack>
        </TableCell>
    </MUITableRow>
)

export default EmptyData;