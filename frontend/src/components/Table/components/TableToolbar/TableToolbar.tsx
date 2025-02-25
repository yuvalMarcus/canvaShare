import {FC, ReactNode} from "react";
import Toolbar from "@mui/material/Toolbar";
import {alpha} from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {Stack} from "@mui/material";

interface TableToolbarProps {
    selected: number[];
    tableTitle: string;
    MultiSelect?: ({ ids }: {ids: number[]}) => ReactNode;
}

const TableToolbar: FC<TableToolbarProps> = ({ selected, tableTitle, MultiSelect }) => {

    const numSelected = selected.length;

    return (
        <Toolbar
            sx={[
                {
                    pl: { sm: 2 },
                    pr: { xs: 1, sm: 1 },
                },
                numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                },
            ]}
        >
            <Stack flex={1} flexDirection="row" alignItems="center" justifyContent="space-between">
                {numSelected > 0 ? (
                    <Typography
                        color="inherit"
                        variant="subtitle1"
                        component="div"
                    >
                        {numSelected} selected
                    </Typography>
                ) : (
                    <Typography
                        variant="h6"
                        id="tableTitle"
                        component="div"
                    >
                        {tableTitle}
                    </Typography>
                )}
                {numSelected > 0 && <MultiSelect ids={selected} />}
            </Stack>
        </Toolbar>
    );
}

export default TableToolbar;