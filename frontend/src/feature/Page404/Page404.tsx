import { Button, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {useNavigate} from "react-router-dom";
import {grey} from "@mui/material/colors";

const Page404 = () => {

    const navigate = useNavigate();

    return (
        <Stack flex={1} justifyContent="center" alignItems="center" gap={5}>
            <img src="/assets/canvashare404.png" alt="404" width={600} />
            <Stack gap={2} justifyContent="center" alignItems="center">
                <Typography variant="h2" color={grey[800]}>Page not found!</Typography>
                <Typography fontSize={18} color={grey[600]}>
                    Are you sure the website URL is correct?
                </Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
                <Button variant="contained" color="primary" onClick={() => navigate("/")}> Home </Button>
                <Button variant="contained" color="primary" onClick={() => navigate(-1)}> Go Back</Button>
            </Stack>
        </Stack>
    );
};

export default Page404;

