import {Stack} from "@mui/material";
import {grey} from "@mui/material/colors";
import {ACTION_TYPE} from "../../paint.config.ts";
import Item from "./Item/Item.tsx";

const Menu = () => (
    <Stack gap={2} minWidth={30} p={1} bgcolor={grey[900]}>
        {Object.values(ACTION_TYPE).map((action: ACTION_TYPE) => <Item key={action} action={action} />)}
    </Stack>
)

export default Menu;