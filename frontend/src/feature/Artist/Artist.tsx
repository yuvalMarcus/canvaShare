import Typography from "@mui/material/Typography";
import {
    Avatar,
    Box, CircularProgress,
    Container,
    IconButton,
    Stack,
} from "@mui/material";
import {grey} from "@mui/material/colors";
import PaintList from "../../components/PaintList/PaintList.tsx";
import * as S from "../Home/Home.style.ts";
import Button from "@mui/material/Button";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useLayoutEffect, useState} from "react";
import {useAuth} from "../../context/auth.context.tsx";
import EditIcon from '@mui/icons-material/Edit';
import UploadPhotoModal from "../../components/UploadPhotoModal/UploadPhotoModal.tsx";
import useGetUser, {GET_USER} from "../../api/hooks/user/useGetUser.ts";
import ReportModal from "../../components/ReportModal/ReportModal.tsx";
import OrderBy from "../../components/OrderBy/OrderBy.tsx";
import useUpdateUser2 from "../../api/hooks/user/useUpdateUser2.ts";
import {toast} from "react-toastify";
import {queryClient} from "../../main.tsx";
import {GET_USERS} from "../../api/hooks/user/useGetUsers.ts";
import InputTags from "../../components/Form/InputTags/InputTags.tsx";
import {UserPayload} from "../../types/user.ts";
import {ReportType} from "../../components/ReportModal/ReportModal.config.ts";

const Artist = () => {
    const [orderBy, setOrderBy] = useState<string>('date');
    const [tags, setTags] = useState<string[]>([]);
    const [isUploadFileOpen, setIsUploadFileOpen] = useState<boolean>(false);
    const [uploadType, setUploadType] = useState<'profile' | 'cover' | null>(null);

    const { id: userIdParam } = useParams();

    const navigate = useNavigate();

    const handleOnSuccess = () => {
        toast.success('Image uploaded successfully');
        queryClient.invalidateQueries({queryKey: [GET_USER, userIdParam]});
        queryClient.invalidateQueries({queryKey: [GET_USERS]});
    }

    const handleOnError = () => {
        toast.error('Image upload failed');
    }

    const { update } = useUpdateUser2({ onSuccess: handleOnSuccess, onError: handleOnError });

    const { userId } = useAuth();

    const { data: user, isPending, isRefetching, isError } = useGetUser(userIdParam);

    const uploadProfilePhoto = async (photo: string) => {
        if(!userIdParam || !uploadType) return;

        const key = `${uploadType}Photo` as keyof UserPayload;

        update({
            id: Number(userIdParam),
            payload: { [key]: photo }
        });

        setUploadType(null);
    }

    const isUserProfileOwner = userId === Number(userIdParam);

    useLayoutEffect(() => {
        if(!user) return;
        setTags(user?.tags || []);
    }, [user]);

    useLayoutEffect(() => {
        if(isPending && !isError) return;
        if(!user) navigate('/404')
    }, [user, isPending, isError])

    return (
        <>
            <S.TopController height={300} boxShadow={2}>
                <Box position='absolute' overflow='hidden' height={300}>
                    <Box position='relative' top='-50%'>
                        <img src={user?.coverPhoto ?? ""} width='100%'  alt='profile cover photo'/>
                    </Box>
                </Box>
                <Container sx={{ height: '100%', position: "relative", zIndex: 10 }}>
                    <Box position="absolute" bottom={-75}>
                        {(isPending || isRefetching) && (
                            <Stack width={150} height={150} zIndex={10} bgcolor={grey[900]} borderRadius='100%' justifyContent="center" alignItems="center">
                                <CircularProgress />
                            </Stack>
                        )}
                        {!isRefetching && !isPending && <Avatar alt="Remy Sharp" src={user?.profilePhoto ?? "/assets/default-user.png"} sx={{ width: 150, height: 150, boxShadow: 4, backgroundColor: grey[100] }} />}
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
                        {(isPending || isRefetching) && <CircularProgress />}
                        {!isRefetching && !isPending && <Typography color={user?.username ? grey[900] : grey[500]} fontWeight="bold" variant="h4" textTransform="capitalize">{user?.username ?? 'username'}</Typography>}
                        {userId && (<ReportModal type={ReportType.ARTIST} userId={userId} />)}
                        {isUserProfileOwner && <Button variant="contained"  to='/paint' component={Link}>add paint</Button>}
                    </Stack>
                    <OrderBy value={orderBy} onChange={setOrderBy} />
                </Stack>
            </Container>
            <Container>
                <Typography px={2} py={1} color={grey[800]}>{user?.about}</Typography>
            </Container>
            <Container>
                <Box py={2}>
                    <InputTags tags={tags} onChange={setTags} />
                </Box>
            </Container>
            <Container>
                <Box py={2}>
                    {userIdParam && <PaintList userId={Number(userIdParam)} tags={tags} order={orderBy} />}
                </Box>
            </Container>
            <UploadPhotoModal label="photo" isOpen={isUploadFileOpen} onUploadFile={uploadProfilePhoto} onClose={() => setIsUploadFileOpen(false)} />
        </>
    )
}

export default Artist;