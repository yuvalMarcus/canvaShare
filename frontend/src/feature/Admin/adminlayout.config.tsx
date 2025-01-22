import {useAuth} from "../../context/auth.context.tsx";
import useGetUser from "../../api/hooks/user/useGetUser.ts";
import GroupIcon from '@mui/icons-material/Group';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ReportIcon from '@mui/icons-material/Report';
import TagIcon from '@mui/icons-material/Tag';


const roleComponents = {
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
        icon: <ReportIcon />,
    },
    ["roles_view"]: {
        segment: 'tags',
        title: 'Tags',
        icon: <TagIcon />,
    },
};

const NavByRole = () => {

    const { isAuth, userId } = useAuth();
    const { data: user, isPending } = useGetUser(userId);

    if (isPending || !user) return [];

    const userRoles = user?.roles || [];

    // Filter roleComponents based on user roles
    const visibleComponents = Object.entries(roleComponents)
        .filter(([role]) => userRoles.includes(role))
        .map(([_, component]) => ({
            segment: component.segment,
            title: component.title,
            icon: component.icon,
        }));

    return visibleComponents
};


export default NavByRole;