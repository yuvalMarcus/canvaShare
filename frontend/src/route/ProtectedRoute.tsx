import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "../context/auth.context.tsx";
import useGetUser from "../api/hooks/user/useGetUser.ts";
import {CircularProgress, Stack} from "@mui/material";

const ProtectedRoute = ({roles}: {roles: string[]}) => {

    const { isAuth, userId } = useAuth();
    const { data: user, isPending } = useGetUser(userId);

    if (isPending && !!userId)
        return (
            <Stack flexDirection="row" justifyContent="center">
                <CircularProgress />
            </Stack>
        )

    const authorized = roles.every(role => (user?.roles || []).includes(role));

    if ((isAuth !== null && !isAuth) || (user && !authorized)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;