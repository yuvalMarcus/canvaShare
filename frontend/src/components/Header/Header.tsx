import React from "react";
import {
    Box,
    Container,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import {Link} from "react-router-dom";
import {grey} from "@mui/material/colors";
import Search from "../Search/Search.tsx";
import * as S from './Header.style.ts';
import {useAuth} from "../../hooks/useAuth.ts";
import * as api from '../../api/auth.ts';
import User from "./User/User.tsx";

const pages = [];

const Header = () => {

    const { isAuth, logout } = useAuth();

    const handleLogout = async () => {
        await api.logout();
        logout();
    }

    return (
        <S.Container position="fixed">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        component={Link}
                        to="/"
                        color={grey[100]}
                    >
                        CanvaShare
                    </Typography>
                    <Stack flex={1} flexDirection="row" ml={2}>
                        {pages.map((page) => (
                            <S.Button
                                key={page}
                                to={page.toLowerCase()}
                                component={Link}
                            >
                                {page}
                            </S.Button>
                        ))}
                        <Box>
                            <Search theme='dark' placeholder='Search Arts' />
                        </Box>
                    </Stack>
                    {!isAuth && (
                      <>
                          <S.Button to={'login'} component={Link}>
                              login
                          </S.Button>
                          <S.Button to={'register'} component={Link}>
                              register
                          </S.Button>
                      </>
                    )}
                    {isAuth && (
                        <User />
                    )}
                </Toolbar>
            </Container>
        </S.Container>
    );
}
export default Header;