import {Avatar, IconButton, Menu, MenuItem} from "@mui/material";
import React, {useState} from "react";
import {useAuth} from "../../../context/auth.context.tsx";
import * as api from "../../../api/auth.ts";
import {useNavigate} from "react-router-dom";
import useGetUser from "../../../api/hooks/useGetUser.ts";
import {grey} from "@mui/material/colors";

export const User  = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const { userId } = useAuth();

    const navigate = useNavigate();

    const { data: user } = useGetUser(userId ?? undefined);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const { logout } = useAuth();

    const handleProfile = async () => {
        navigate(`artist/${userId}`)
        handleClose();
    }

    const handleLogout = async () => {
        await api.logout();
        logout();
        handleClose();
    }

    return (
        <>
            <IconButton
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                <Avatar alt="Remy Sharp" src={user?.profilePhoto ?? "/assets/default-user.png"} sx={{ backgroundColor: grey[100] }} />
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
                <MenuItem onClick={handleClose}>My Account</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
        </>
    )
}

export default User;