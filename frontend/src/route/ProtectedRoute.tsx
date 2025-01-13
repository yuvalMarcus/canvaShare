import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "../context/auth.context.tsx";
import useGetUser from "../api/hooks/user/useGetUser.ts";

const ProtectedRoute = ({ roles }) => {

    const { isAuth, userId } = useAuth();
    const { data: user } = useGetUser(userId);

   // const authorized = (user?.roles || []).some(role => roles.includes(role));

    if ((isAuth !== null && !isAuth)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;