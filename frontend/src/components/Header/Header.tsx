import {
    Box, CircularProgress,
    Container,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {grey} from "@mui/material/colors";
import Search from "../Search/Search.tsx";
import * as S from './Header.style.ts';
import {useAuth} from "../../context/auth.context.tsx";
import User from "./User/User.tsx";

const pages = [];

const Header = () => {

    const { isAuth, refreshTokenIsPending } = useAuth();

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    
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
                            <Search theme='dark' placeholder='Search Paints' value={searchParams.get('text') || ''} onClick={(value) => navigate(`/search?text=${value}`)} />
                        </Box>
                    </Stack>
                    {refreshTokenIsPending && (
                        <Stack justifyContent="center">
                            <CircularProgress size={24} />
                        </Stack>
                    )}
                    {!refreshTokenIsPending && !isAuth && (
                      <>
                          <S.Button to={'login'} component={Link}>
                              login
                          </S.Button>
                          <S.Button to={'register'} component={Link}>
                              register
                          </S.Button>
                      </>
                    )}
                    {!refreshTokenIsPending && isAuth && (
                        <User />
                    )}
                </Toolbar>
            </Container>
        </S.Container>
    );
}
export default Header;