import {useAuth} from "../../context/auth.context.tsx";
import useGetUser from "../../api/hooks/user/useGetUser.ts";
import React from "react";

const Permissions = ({roles, children}: {roles: string[], children?: React.ReactNode}) => {

    const { isAuth, userId } = useAuth();
    const { data: user, isPending } = useGetUser(userId);

    if (isPending && !!userId || !user)
        return null;

    const authorized = roles.every(role => (user?.roles || []).includes(role));

    if ((isAuth !== null && !isAuth) || (user && !authorized))
        return null;


    return <>{children}</>;
};

export default Permissions;