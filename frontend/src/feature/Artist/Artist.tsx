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
import * as S from "../Home/Home.style.ts";
import Button from "@mui/material/Button";
import {Link, useParams} from "react-router-dom";
import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import * as userApi from "../../api/user.ts";
import * as tagApi from "../../api/tags.ts";
import {useAuth} from "../../context/auth.context.tsx";

const Artist = () => {
    const [orderBy, setOrderBy] = useState<string>('date');
    const [tags, setTags] = useState<string[]>([]);

    const { userId } = useAuth();

    const { id: userIdParam } = useParams();

    const { data: user, isPending: isPendingData2 } = useQuery({
        queryKey: [userIdParam],
        queryFn: () => userApi.getUser(userIdParam),
    });

    const { data: tagsList, isPending: isPendingData } = useQuery({
        queryKey: [],
        queryFn: tagApi.getTags,
    });

    const isUserProfileOwner = userId === Number(userIdParam);

    return (
        <>
            <S.TopController height={300} boxShadow={2}>
                <Container sx={{ height: '100%', position: "relative" }}>
                    <Avatar alt="Remy Sharp" src="/assets/p_avatar.jpg" sx={{ width: 150, height: 150, position: 'absolute', bottom: -75, boxShadow: 4, backgroundColor: '#fff' }} />
                </Container>
            </S.TopController>
            <Container>
                <Stack flexDirection="row" alignItems="center" justifyContent="space-between" gap={3} pl={20} py={1} mb={4}>
                    <Stack flexDirection="row" gap={2}>
                        <Typography color={grey[900]} fontWeight="bold" variant="h4" textTransform="capitalize">{user?.username}</Typography>
                        {isUserProfileOwner && <Button variant="contained"  to='/painter' component={Link}>add painter</Button>}
                    </Stack>
                    <Stack flexDirection="row" alignItems="center" gap={2}>
                        <Typography whiteSpace="nowrap" color={grey[700]} fontWeight="bold" fontSize={18} textTransform="capitalize">
                            Order By :
                        </Typography>
                        <FormControl variant="standard">
                            <Select
                                value={orderBy}
                                onChange={(event) => setOrderBy(event.target.value)}
                            >
                                <MenuItem value={'date'}>Date</MenuItem>
                                <MenuItem value={'likes'}>Like</MenuItem>
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
                        options={tagsList?.tags?.map(({ name }) => name) || []}
                        defaultValue={tags}
                        filterSelectedOptions
                        onChange={(_, tags) => setTags(tags)}
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
                    {userIdParam && <CanvasList userId={Number(userIdParam)} tags={tags.join(', ')} order={orderBy} />}
                </Box>
            </Container>
        </>
    )
}

export default Artist;