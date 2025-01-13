import Header from "../Header/Header";
import {Stack} from "@mui/material";
import {Outlet} from "react-router-dom";

const Layout = () => {
    return (
        <Stack minHeight="calc(100% - 64px)" pt={8}>
            <Header />
            <Outlet />
        </Stack>
    )
}

export default Layout;