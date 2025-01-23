import {Box, Stack} from "@mui/material";
import Button from "@mui/material/Button";
import GroupIcon from '@mui/icons-material/Group';
import FlagIcon from '@mui/icons-material/Flag';
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';
import DashboardCard from "./DashboardCard/DashboardCard.tsx";
import TagIcon from "@mui/icons-material/Tag";
import useGetUsers from "../../../api/hooks/user/useGetUsers.ts";
import useGetPaints from "../../../api/hooks/paint/useGetPaints.ts";
import useGetTags from "../../../api/hooks/tag/useGetTags.ts";
import useGetReports from "../../../api/hooks/report/useGetReports.ts";
import Permissions from "../../../components/Permissions/Permissions.tsx";
import {useNavigate} from "react-router-dom";

const Dashboard = () => {

    const navigate = useNavigate();

    const { data: users } = useGetUsers({});

    const { data: paints } = useGetPaints();

    const { data: reports } = useGetReports();

    const { data: tags } = useGetTags();

    return (
        <Stack gap={8}>
            <Stack flexDirection="row" gap={8}>
                <Permissions roles={['user_view']}>
                    <Box width="50%">
                        <DashboardCard title="users" Icon={<GroupIcon fontSize="large" />} value={users?.results?.length}>
                            <Stack flexDirection="row" gap={2}>
                                <Button variant="contained" onClick={() => navigate('/admin/users')}>view users</Button>
                                <Permissions roles={['user_management']}>
                                    <Button variant="contained" onClick={() => navigate('/admin/users/create')}>add user</Button>
                                </Permissions>
                            </Stack>
                        </DashboardCard>
                    </Box>
                </Permissions>
                <Permissions roles={['paint_view']}>
                    <Box width="50%">
                        <DashboardCard title="paints" Icon={<PhotoSizeSelectActualIcon fontSize="large" />} value={paints?.results.length}>
                            <Stack flexDirection="row" gap={2}>
                                <Button variant="contained" onClick={() => navigate('/admin/paints')}>view paints</Button>
                            </Stack>
                        </DashboardCard>
                    </Box>
                </Permissions>
            </Stack>
            <Stack flexDirection="row" gap={8}>
                <Permissions roles={['report_view']}>
                    <Box width="50%">
                        <DashboardCard title="reports" Icon={<FlagIcon fontSize="large" />} value={reports?.results.length}>
                            <Stack flexDirection="row" gap={2}>
                                <Button variant="contained" onClick={() => navigate('/admin/reports')}>view reports</Button>
                            </Stack>
                        </DashboardCard>
                    </Box>
                </Permissions>
                <Permissions roles={['tag_view']}>
                    <Box width="50%">
                        <DashboardCard title="tags" Icon={<TagIcon fontSize="large" />} value={tags?.results.length}>
                            <Stack flexDirection="row" gap={2}>
                                <Button variant="contained" onClick={() => navigate('/admin/tags')}>view tags</Button>
                            </Stack>
                        </DashboardCard>
                    </Box>
                </Permissions>
            </Stack>
        </Stack>
    )
}

export default Dashboard;