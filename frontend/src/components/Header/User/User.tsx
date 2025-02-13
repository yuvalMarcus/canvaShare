import {Avatar, Drawer, IconButton, Menu, MenuItem} from "@mui/material";
import React, {useState} from "react";
import {useAuth} from "../../../context/auth.context.tsx";
import * as api from "../../../api/auth.ts";
import {useNavigate} from "react-router-dom";
import useGetUser from "../../../api/hooks/user/useGetUser.ts";
import {grey} from "@mui/material/colors";
import UserAccount from "../../UserAccount/UserAccount.tsx";
import {toast} from "react-toastify";
import Permissions from "../../Permissions/Permissions.tsx";

export const User  = () => {
    const [accountIsOpen, setAccountIsOpen] = useState(false);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const { userId } = useAuth();

    const navigate = useNavigate();

    const { data: user } = useGetUser(userId ?? null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const { logout } = useAuth();

    const handleProfile = async () => {
        navigate(`/artist/${userId}`)
        handleClose();
    }

    const handleAccount = async () => {
        setAccountIsOpen(true);
        handleClose();
    }

    const handleAdmin = async () => {
        navigate(`/admin`)
        handleClose();
    }

    const handleLogout = async () => {
        await api.logout();
        logout();
        handleClose();
        toast.success('Logout successfully');
        navigate("/");
    }

    return (
        <>
            <IconButton onClick={handleClick}>
                <Avatar src={user?.profilePhoto || "/assets/default-user.png"} sx={{ backgroundColor: grey[100] }} />
            </IconButton>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                <MenuItem onClick={handleAccount}>My Account</MenuItem>
                <Permissions roles={['admin_view']}>
                    <MenuItem onClick={handleAdmin}>Admin</MenuItem>
                </Permissions>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
            <Drawer open={accountIsOpen} anchor="right" onClose={() => setAccountIsOpen(false)}>
                <UserAccount />
            </Drawer>
        </>
    )
}

export default User;