import { useAtom } from 'jotai'
import { isLoginAtom } from "../state/auth.ts";

export const useAuth = () => {
    const [isLogin, setIsLogin] = useAtom(isLoginAtom);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        setIsLogin(true);
    }

    const logout = () => {
        localStorage.removeItem('token');
        setIsLogin(false);
    }

    return {
        login,
        logout,
        isLogin,
    }
}