import Typography from "@mui/material/Typography";
import {
    Autocomplete,
    Avatar,
    Box,
    Container,
    FormControl, IconButton,
    MenuItem,
    Select,
    Stack,
    TextField
} from "@mui/material";
import {grey} from "@mui/material/colors";
import CanvasList, {GET_CANVAS} from "../../components/CanvasList/CanvasList.tsx";
import * as S from "../Home/Home.style.ts";
import Button from "@mui/material/Button";
import {Link, useParams} from "react-router-dom";
import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import * as userApi from "../../api/user.ts";
import * as tagApi from "../../api/tags.ts";
import {useAuth} from "../../context/auth.context.tsx";
import EditIcon from '@mui/icons-material/Edit';
import UploadFileModal from "../../components/UploadFileModal/UploadFileModal.tsx";
import {useMutation} from "@tanstack/react-query";
import useGetUser, {GET_USER} from "../../api/hooks/useGetUser.ts";
import {queryClient} from "../../main.tsx";

const Artist = () => {
    const [orderBy, setOrderBy] = useState<string>('date');
    const [tags, setTags] = useState<string[]>([]);
    const [isUploadFileOpen, setIsUploadFileOpen] = useState<boolean>(false);
    const [uploadType, setUploadType] = useState<'profile' | 'cover' | null>(null);

    const { userId } = useAuth();

    const { id: userIdParam } = useParams();

    const { data: user } = useGetUser(userIdParam);

    const { mutateAsync, isSuccess, isPending, isError, isPaused, isIdle } = useMutation({
        mutationFn: userApi.updateUser,
        onSuccess: () => {},
        onError: () => {}
    })

    const { data: tagsList, isPending: isPendingData } = useQuery({
        queryKey: [],
        queryFn: tagApi.getTags,
    });

    const uploadProfilePhoto = async (photo) => {
        if(!userIdParam || !uploadType) return;

        await mutateAsync({ id: Number(userIdParam), payload: {
                [`${uploadType}Photo`]: photo
            } })
        setUploadType(null);
        queryClient.invalidateQueries({ queryKey: [GET_USER] });
        queryClient.invalidateQueries({ queryKey: [GET_CANVAS] });
    }

    const isUserProfileOwner = userId === Number(userIdParam);

    return (
        <>
            <S.TopController height={300} boxShadow={2} bgcolor={grey[800]}>
                <Box position={'absolute'} overflow='hidden' height={300}>
                    <Box position={'relative'} sx={{ top: '-50%' }}>
                        <img src={user?.coverPhoto ?? ""} width={'100%'} />
                    </Box>
                </Box>
                <Container sx={{ height: '100%', position: "relative", zIndex: 10 }}>
                    <Box position="absolute" bottom={-75}>
                        <Avatar alt="Remy Sharp" src={user?.profilePhoto ?? "/assets/default-user.png"} sx={{ width: 150, height: 150, boxShadow: 4, backgroundColor: grey[100] }} />
                        {isUserProfileOwner && (
                            <Box position="absolute" top={0} right={0} zIndex={10} bgcolor={grey[100]} borderRadius="100%" boxShadow={1}>
                                <IconButton onClick={() => {
                                    setUploadType('profile')
                                    setIsUploadFileOpen(true);
                                }}>
                                    <EditIcon />
                                </IconButton>
                            </Box>
                        )}
                    </Box>
                    {isUserProfileOwner && (
                        <Box position="absolute" bottom={10} right={24} zIndex={10} bgcolor={grey[100]} borderRadius="100%" boxShadow={1}>
                            <IconButton onClick={() => {
                                setUploadType('cover')
                                setIsUploadFileOpen(true);
                            }}>
                                <EditIcon />
                            </IconButton>
                        </Box>
                    )}
                </Container>
            </S.TopController>
            <Container>
                <Stack flexDirection="row" alignItems="center" justifyContent="space-between" gap={3} pl={20} py={1} mb={4}>
                    <Stack flexDirection="row" gap={2}>
                        <Typography color={user?.username ? grey[900] : grey[500]} fontWeight="bold" variant="h4" textTransform="capitalize">{user?.username ?? 'username'}</Typography>
                        {isUserProfileOwner && <Button variant="contained"  to='/painter' component={Link}>add paint</Button>}
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
            <UploadFileModal isOpen={isUploadFileOpen} onUploadFile={uploadProfilePhoto} onClose={() => setIsUploadFileOpen(false)} />
        </>
    )
}

export default Artist;