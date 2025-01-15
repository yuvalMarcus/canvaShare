import Typography from "@mui/material/Typography";
import {grey} from "@mui/material/colors";
import {FormControl, MenuItem, Select, Stack} from "@mui/material";
import {FC} from "react";
import {orderByList} from "./orderBy.config.ts";

interface OrderByProps {
    value: string;
    onChange: (value: string) => void;
}

const OrderBy: FC<OrderByProps> = ({ value, onChange }) => (
    <Stack flexDirection="row" alignItems="center" gap={2}>
        <Typography whiteSpace="nowrap" color={grey[700]} fontWeight="bold" fontSize={18} textTransform="capitalize">
            Order By :
        </Typography>
        <FormControl variant="standard">
            <Select
                value={value}
                onChange={(event) => onChange(event.target.value as string)}
            >
                {orderByList.map(({ value, label }) => <MenuItem key={label} value={value}>{label}</MenuItem>)}
            </Select>
        </FormControl>
    </Stack>
)

export default OrderBy;