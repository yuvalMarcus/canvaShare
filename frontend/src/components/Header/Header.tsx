import React from "react";
import {
    Container,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import {Link} from "react-router-dom";
import {grey} from "@mui/material/colors";
import Search from "../Search/Search.tsx";
import * as S from './Header.style.ts';

const pages = ['Explore'];

const Header = () => {
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
                        <Search />
                    </Stack>
                    <S.Button
                        to={'login'}
                        component={Link}
                    >
                        login
                    </S.Button>
                    <S.Button
                        to={'register'}
                        component={Link}
                    >
                        register
                    </S.Button>
                </Toolbar>
            </Container>
        </S.Container>
    );
}
export default Header;