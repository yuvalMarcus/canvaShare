import PaintList from "../../components/PaintList/PaintList.tsx";
import {Box, Container} from "@mui/material";
import Typography from "@mui/material/Typography";
import {grey} from "@mui/material/colors";
import * as S from './Home.style.ts';

const Home = () => {
    return (
        <>
            <S.TopController alignItems="center" justifyContent="center" p={2} boxShadow={3} height={400}>
                <Typography variant="h2">CanavShare</Typography>
                <Typography variant="p" maxWidth={600}>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries</Typography>
            </S.TopController>
            <Container fixed>
                <Box py={2}>
                    <Typography variant="h4" color={grey[600]} mb={2}>
                        List of Arts
                    </Typography>
                    <PaintList cardDetails />
                </Box>
            </Container>
        </>
    )
}

export default Home;