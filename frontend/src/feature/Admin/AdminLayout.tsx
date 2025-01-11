import * as React from 'react';
import { extendTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { AppProvider, Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import {Outlet, useNavigate} from "react-router-dom";
import User from "../../components/Header/User/User.tsx";

const NAVIGATION: Navigation = [
    {
        kind: 'header',
        title: 'Main items',
    },
    {
        segment: '',
        title: 'Dashboard',
        icon: <DashboardIcon />,
    },
    {
        segment: 'users',
        title: 'Users',
        icon: <GroupIcon />,
    },
    {
        segment: 'paintings',
        title: 'Paintings',
        icon: <ColorLensIcon />,
    },
];

const demoTheme = extendTheme({
    colorSchemes: { light: true },
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

    return (
        <AppProvider
            navigation={NAVIGATION}
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
                toolbarAccount: () => <User />
            }}>
                <PageContainer>
                    <Outlet />
                </PageContainer>
            </DashboardLayout>
        </AppProvider>
    );
}

export default AdminLayout;