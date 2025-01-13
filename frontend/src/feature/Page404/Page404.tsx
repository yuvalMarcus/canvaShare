import { Button, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {useNavigate} from "react-router-dom";


const Page404 = () => {

    const navigate = useNavigate();

    return (
        <Stack justifyContent="center" alignItems="center" gap={5} height="100%">
            <img src="/assets/canvashare404.png" alt="404" style={{width: '40%'}} />
            <Stack gap={2} justifyContent="center" alignItems="center">
                <Typography variant="h2">
                    Page not found!</Typography>
                <Typography variant="h6">
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

