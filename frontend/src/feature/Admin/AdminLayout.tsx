import { extendTheme } from '@mui/material/styles';
import { AppProvider, NavigationItem } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import {Outlet, useNavigate} from "react-router-dom";
import Admin from "../../components/Header/Admin/Admin.tsx";
import {useAuth} from "../../context/auth.context.tsx";
import useGetUser from "../../api/hooks/user/useGetUser.ts";
import {navByRole} from "./adminlayout.config.tsx";

const header: NavigationItem =
    {
        kind: 'header',
        title: 'Main items',
    };

const demoTheme = extendTheme({
    colorSchemes: { light: true, dark: true },
    colorSchemeSelector: 'class',
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 600,
            lg: 1200,
            xl: 1536,
        },
    },
});

const AdminLayout = () => {

    const navigate = useNavigate();

    const { userId } = useAuth();

    const { data: user } = useGetUser(userId);

    const roleComponents = navByRole(user?.roles || []);

    const combinedNavigation = [header, ...roleComponents];

    return (
        <AppProvider
            navigation={combinedNavigation}
            router={{
                pathname: 'admin',
                searchParams: new URLSearchParams(),
                navigate: (path: string | URL) => navigate(`/admin${path}`),
            }}
            branding={{
                logo: '',
                title: 'Admin',
                homeUrl: '/',
            }}
            theme={demoTheme}
        >
            <DashboardLayout slots={{
                toolbarAccount: Admin
            }}>
                <PageContainer>
                    <Outlet />
                </PageContainer>
            </DashboardLayout>
        </AppProvider>
    );
}

export default AdminLayout;