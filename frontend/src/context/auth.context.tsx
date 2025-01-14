import {createContext, useContext, useLayoutEffect, useState} from 'react';
import * as cookie from "../utils/cookie.ts";
import userRefreshToken from "../api/hooks/auth/useRefreshToken.ts";

const AuthContext = createContext<{
    isAuth: boolean | null;
    userId: number | null;
    setCertificate: (token: string, refreshToken: string, userId: number) => void;
    login: () => void;
    logout: () => void;
    refreshToken: () => void;
    refreshTokenIsPending: boolean;
}>({
    isAuth: null,
    userId: null,
    setCertificate: () => {},
    login: () => {},
    logout: () => {},
    refreshToken: () => {},
    refreshTokenIsPending: false
});

const AuthProvider = ({ children }) => {
    const [isAuth, setIsAuth] = useState<boolean>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const {mutateAsync, isPending} = userRefreshToken();

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