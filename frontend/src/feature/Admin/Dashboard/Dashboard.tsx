import {CardContent, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import GroupIcon from '@mui/icons-material/Group';
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';

const Dashboard = () => {
    return (
        <Stack flexDirection="row" gap={4}>
            <Card variant="outlined" sx={{ height: '100%', flexGrow: 1, boxShadow: 2 }}>
                <CardContent>
                    <Typography component="h2" variant="subtitle2" gutterBottom>
                        users
                    </Typography>
                    <Stack direction="column" sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 2 }}>
                        <Stack sx={{ justifyContent: 'space-between' }}>
                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h4" component="p">
                                    123
                                </Typography>
                                <GroupIcon fontSize="large" />
                            </Stack>
                        </Stack>
                        <Stack flexDirection="row" gap={2}>
                            <Button variant="contained">view users</Button>
                            <Button variant="contained">add user</Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
            <Card variant="outlined" sx={{ height: '100%', flexGrow: 1, boxShadow: 2 }}>
                <CardContent>
                    <Typography component="h2" variant="subtitle2" gutterBottom>
                        users
                    </Typography>
                    <Stack direction="column" sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 2 }}>
                        <Stack sx={{ justifyContent: 'space-between' }}>
                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h4" component="p">
                                    123
                                </Typography>
                                <PhotoSizeSelectActualIcon fontSize="large" />
                            </Stack>
                        </Stack>
                        <Stack flexDirection="row" gap={2}>
                            <Button variant="contained">view users</Button>
                            <Button variant="contained">add user</Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    )
}

export default Dashboard;