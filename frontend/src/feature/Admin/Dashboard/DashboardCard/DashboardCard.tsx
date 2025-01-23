import {CardContent, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {FC, ReactNode} from "react";
import Card from "@mui/material/Card";
import {grey} from "@mui/material/colors";

interface DashboardCardProps {
    Icon:  ReactNode;
    title: string;
    value: number;
    children: ReactNode;
}

const DashboardCard: FC<DashboardCardProps> = ({ title, Icon, value, children }) => {

    return (
        <Card variant="outlined" sx={{ boxShadow: 2 }}>
            <CardContent>
                <Typography variant="h5" color={grey[600]} mb={2}>
                    {title}
                </Typography>
                <Stack direction="column" justifyContent="space-between" flexGrow={1} gap={2}>
                    <Stack justifyContent="space-between">
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h4" component="p">
                                {value}
                            </Typography>
                            {Icon}
                        </Stack>
                    </Stack>
                    {children}
                </Stack>
            </CardContent>
        </Card>
    )
}

export default DashboardCard;