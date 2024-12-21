import {createContext, useContext, useLayoutEffect, useState} from 'react';
import {useMutation} from "@tanstack/react-query";
import * as api from "../api/auth.ts";
import * as cookie from "../utils/cookie.ts";

const AuthContext = createContext<{
    isAuth: boolean;
    userId: number | null;
    setCertificate: (token: string, refreshToken: string, userId: number) => void;
    login: () => void;
    logout: () => void;
    refreshToken: () => void;
    refreshTokenIsPending: boolean;
}>({
    isAuth: false,
    userId: null,
    setCertificate: () => {},
    login: () => {},
    logout: () => {},
    refreshToken: () => {},
    refreshTokenIsPending: false
});

const AuthProvider = ({ children }) => {
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [userId, setUserId] = useState<number | null>(null);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.refreshToken,
    })

    const setCertificate = (token, refreshToken, userId) => {
        cookie.setCookie('userId', userId, 1);
        cookie.setCookie('token', token, 1);
        cookie.setCookie('refreshToken', refreshToken, 7);
    }

    const login = () => {
        const token = cookie.getCookie('token');
        const userId = cookie.getCookie('userId');
        setIsAuth(!!token);
        setUserId(userId ? Number(userId) : null);
        return !!token;
    }

    const logout = () => {
        cookie.removeCookie('token');
        cookie.removeCookie('refreshToken');
        cookie.removeCookie('userId');
        setUserId(null);
        setIsAuth(false);
    }

    const refreshToken = async () => {

        const refreshToken = cookie.getCookie('refreshToken');

        if (!refreshToken) return;

        const { data } = await mutateAsync({ refreshToken });

        setCertificate(data.token, data.refreshToken, data.userId);
        login();
    }

    useLayoutEffect( () => {
        (async () => {

            if (login()) return;

            await refreshToken();
        })();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuth, userId, setCertificate, login, logout, refreshToken, refreshTokenIsPending: isPending }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;