import GroupIcon from '@mui/icons-material/Group';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import FlagIcon from '@mui/icons-material/Flag';
import TagIcon from '@mui/icons-material/Tag';
import DashboardIcon from "@mui/icons-material/Dashboard";


const roleComponents = {
    ["admin_view"]: {
        segment: '',
        title: 'Dashboard',
        icon: <DashboardIcon />,
    },
    ["user_view"]: {
        segment: 'users',
        title: 'Users',
        icon: <GroupIcon />,
    },
    ["paint_view"]: {
        segment: 'paints',
        title: 'Paints',
        icon: <ColorLensIcon />,
    },
    ["report_view"]: {
        segment: 'reports',
        title: 'Reports',
        icon: <FlagIcon />,
    },
    ["roles_view"]: {
        segment: 'tags',
        title: 'Tags',
        icon: <TagIcon />,
    },
};

export const navByRole = (userRoles: string[]) => {
    // Filter roleComponents based on user roles
    return Object.entries(roleComponents)
        .filter(([role]) => userRoles.includes(role))
        .map(([_, component]) => ({
            segment: component.segment,
            title: component.title,
            icon: component.icon,
        }))
};