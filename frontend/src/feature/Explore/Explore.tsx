import {Box, Container, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import PaintList from "../../components/PaintList/PaintList.tsx";
import {grey} from "@mui/material/colors";
import ArtistsList from "../../components/ArtistsList/ArtistsList.tsx";
import {useState} from "react";
import OrderBy from "../../components/OrderBy/OrderBy.tsx";
import Tags from "../../components/Tags/Tags.tsx";

const Explore = () => {
    const [orderBy, setOrderBy] = useState<string>('date');
    const [tags, setTags] = useState<string[]>([]);

    return (
        <Container>
            <Stack gap={4} py={2}>
                <Box>
                    <Typography variant="h4" color={grey[600]} textTransform="capitalize" mb={4}>
                        popular artists
                    </Typography>
                    <ArtistsList />
                </Box>
                <Box>
                    <Typography variant="h4" color={grey[600]} textTransform="capitalize" mb={4}>
                        popular arts
                    </Typography>
                    <Stack flexDirection="row" alignItems="center" gap={4} mb={4}>
                        <Stack flex={1}>
                            <Tags tags={tags} onChange={setTags} />
                        </Stack>
                        <OrderBy value={orderBy} onChange={setOrderBy} />
                    </Stack>
                    <PaintList tags={tags} order={orderBy} cardDetails />
                </Box>
            </Stack>
        </Container>
    )
}

export default Explore;