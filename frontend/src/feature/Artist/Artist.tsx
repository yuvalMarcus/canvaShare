import Typography from "@mui/material/Typography";
import {
    Autocomplete,
    Avatar,
    Box,
    Container,
    FormControl,
    MenuItem,
    Select,
    Stack,
    TextField
} from "@mui/material";
import {grey} from "@mui/material/colors";
import CanvasList from "../../components/CanvasList/CanvasList.tsx";
import {top100Films} from "../../mook.ts";
import * as S from "../Home/Home.style.ts";

const Artist = () => {
    return (
        <>
            <S.TopController height={300} boxShadow={2}>
                <Container sx={{ height: '100%', position: "relative" }}>
                    <Avatar alt="Remy Sharp" src="/assets/p_avatar.jpg" sx={{ width: 150, height: 150, position: 'absolute', bottom: -75, boxShadow: 4, backgroundColor: '#fff' }} />
                </Container>
            </S.TopController>
            <Container>
                <Stack flexDirection="row" alignItems="center" justifyContent="space-between" gap={3} pl={20} py={1} mb={4}>
                    <Typography color={grey[900]} fontWeight="bold" variant="h4" textTransform="capitalize">artist nickname</Typography>
                    <Stack flexDirection="row" alignItems="center" gap={2}>
                        <Typography whiteSpace="nowrap" color={grey[700]} fontWeight="bold" fontSize={18} textTransform="capitalize">
                            Order By :
                        </Typography>
                        <FormControl variant="standard">
                            <Select
                                value={'date'}
                                onChange={() => {}}
                            >
                                <MenuItem value={'date'}>Date</MenuItem>
                                <MenuItem value={'likes'}>Like</MenuItem>
                                <MenuItem value={'tags'}>Tags</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </Stack>
            </Container>
            <Container>
                <Box py={2}>
                    <Autocomplete
                        multiple
                        id="tags-outlined"
                        options={top100Films}
                        getOptionLabel={(option) => option.title}
                        defaultValue={[top100Films[13]]}
                        filterSelectedOptions
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Tags List"
                                placeholder="Tags"
                            />
                        )}
                    />
                </Box>
            </Container>
            <Container>
                <Box py={2}>
                    <CanvasList />
                </Box>
            </Container>
        </>
    )
}

export default Artist;