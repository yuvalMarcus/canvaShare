import User from "../User/User.tsx";
import {Box, IconButton} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import {useNavigate} from "react-router-dom";

const Admin = () => {
    const navigate = useNavigate();
    return (
        <Box>
            <IconButton onClick={() => navigate('/')}>
                <HomeIcon fontSize='large' />
            </IconButton>
            <User />
        </Box>
    );
};

export default Admin;