import { useAtom } from 'jotai'
import { isLoginAtom } from "../state/auth.ts";

interface UseAuth {
    isAuth: boolean;
    login: (token: string) => void;
    logout: () => void;
}

export const useAuth = (): UseAuth => {
    const [isAuth, setIsAuth] = useAtom(isLoginAtom);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        setIsAuth(true);
    }

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuth(false);
    }

    return {
        isAuth,
        login,
        logout,
    }
}