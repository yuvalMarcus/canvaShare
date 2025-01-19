import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar, Box, Checkbox, CircularProgress, Container, FormControlLabel, IconButton, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { grey } from "@mui/material/colors";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import {useEffect, useState} from "react";
import InputText from "../../../components/Form/InputText/InputText.tsx";
import EditIcon from "@mui/icons-material/Edit";
import UploadFileModal from "../../../components/UploadFileModal/UploadFileModal.tsx";
import useCreateUser from "../../../api/hooks/user/useCreateUser.ts";
import Textarea from "../../../components/Form/Textarea/Textarea.tsx";
import useGetUser from "../../../api/hooks/user/useGetUser.ts";
import useUpdateUser from "../../../api/hooks/user/useUpdateUser.ts";
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import {useNavigate, useParams} from "react-router-dom";

const roles = [
    'admin_user_view',
    'admin_user_management',
    'admin_paint_view',
    'admin_paint_management',
    'admin_report_view',
    'admin_report_management',
    'admin_roles_view',
    'admin_roles_management']

const schema = z.object({
    username: z.string().min(4, { message: "Required" }),
    email: z.string().email({ message: "Email not valid" })
});

const UserForm = () => {
    const [isUploadFileOpen, setIsUploadFileOpen] = useState<boolean>(false);
    const {mutate: createUser, isPending: createIsPending} = useCreateUser();
    const {mutate: updateUser, isPending: updateIsPending} = useUpdateUser();
    const { id: userId } = useParams();
    const { data: user, isPending: getIsPending } = useGetUser(userId ?? 0);
    const navigate = useNavigate();

    const {
        handleSubmit,
        control,
        setValue,
        getValues
    } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async () => {
        const username = getValues('username')
        const email = getValues('email')
        const password = getValues('password')
        const about = getValues('about')
        const profilePhoto = getValues('profilePhoto')
        const roles = getValues('roles')

        if (!userId) {
            createUser({username, email, password, about, roles, profilePhoto});
        }
        else{
            if (password)
                updateUser({id: userId, payload: {username, email, about, password, roles, profilePhoto}});
            else
                updateUser({id: userId, payload: {username, email, about, roles, profilePhoto}});
        }
    };

    const uploadProfilePhoto = async (profilePhoto: string|null) => {
        setValue("profilePhoto", profilePhoto);
        if (user)
            user.profilePhoto = profilePhoto;
    }

    const handleReturn = () => {
        navigate(-1);
    }

    useEffect(() =>{
        if (userId){
            setValue('username', user?.username)
            setValue('email', user?.email)
            setValue('password', '')
            setValue('about', user?.about ?? '')
            setValue('profilePhoto', user?.profilePhoto ?? '')
            setValue('roles', user?.roles ?? [])
        }
    }, [setValue, user, userId, getValues])

    return (
        <>
            <Stack flexDirection="row" alignItems='center' onClick={handleReturn}>
                <ArrowBackOutlinedIcon fontSize={'large'} />
                <Box pl={1}>Return</Box>
            </Stack>
            <Stack alignItems="center" justifyContent="center" flex={1}>
                <Box
                    p={2}
                    borderRadius={2}
                    minWidth={550}
                    boxShadow={2}
                    position={'relative'}>
                    <Box position='absolute'>
                        <AppRegistrationIcon fontSize="large" />
                    </Box>
                    <Stack flexDirection="column" mt={2}>
                        <Stack alignItems="center" justifyContent="center" pb={2}>
                            <Typography variant="h4" >
                                {!userId && <>Add User</> || <>Edit User</>}
                            </Typography>
                        </Stack>
                        {(!getIsPending || !userId) &&
                        <Container>
                            <Stack alignItems="center" justifyContent="center" flexDirection='row' pb={2}>
                                <Box position='relative' left={20}>
                                    <Avatar alt="Remy Sharp"
                                            sx={{ width: 100, height: 100, boxShadow: 4}}
                                            src={user ? user?.profilePhoto : getValues('profilePhoto')} />
                                </Box>
                                <Box position="relative" width={40} bottom={30} right={10} zIndex={10} bgcolor={grey[100]} borderRadius={'100%'} boxShadow={1}>
                                    <IconButton onClick={() => {
                                        setIsUploadFileOpen(true);
                                    }}>
                                        <EditIcon />
                                    </IconButton>
                                </Box>

                            </Stack>
                        </Container>}
                    </Stack>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack alignItems="center" justifyContent="center">
                            <Box width={'50%'} pb={1}>
                                <InputText label="Username" name="username" control={control} />
                            </Box>
                            <Box width={'50%'} pb={1}>
                                <InputText label="Email" name="email" control={control} />
                            </Box>
                            <Box width={'50%'} pb={1}>
                                <InputText label="Password" name="password" f_type="password" control={control} />
                            </Box>
                            <Box width={'50%'} pb={1}>
                                <Textarea label="About" name="about" rows={4} control={control}/>
                            </Box>
                        </Stack>
                        <Box mt={1} mb={2} ml={4}>
                            <Typography variant="h6" color={grey[700]}>
                                Select user roles
                            </Typography>
                            <Stack flexDirection="row">
                                {!getIsPending && getValues("roles") && [0, 1].map(i => {
                                    return (
                                    <Stack flexDirection="column" pr={5} key={`col-${i}`}>
                                        {roles.slice(i*4, 4 * (i+1)).map((role) => {
                                            return (
                                                <Box display="block" key={role[1]}>
                                                    <FormControlLabel
                                                        control={<Checkbox defaultChecked={!!(getValues("roles")?.includes(role[1]))} />}
                                                        label={<Typography textTransform={"capitalize"}>{role.replaceAll('_', ' ')}</Typography>}
                                                        onChange={(e) => setValue("roles",
                                                            [
                                                                ...(e.target.checked ? [role[1]] : []),
                                                                ...(getValues("roles")?.filter((j: string) => j !== role[1]) ?? [])
                                                            ])} />
                                                </Box>
                                            )})}
                                    </Stack>
                                    )
                                })}
                            </Stack>
                        </Box>
                        <Stack alignItems="center" justifyContent="center">
                                <Button variant="outlined" type="submit" disabled={createIsPending || updateIsPending}>
                                    {(createIsPending || updateIsPending) && (
                                        <Stack alignItems="center" justifyContent="center">
                                            <CircularProgress size={24} />
                                        </Stack>
                                    )}
                                    {!(createIsPending || updateIsPending) && (
                                        <Typography textAlign="center">
                                            &nbsp;&nbsp;submit&nbsp;&nbsp;
                                        </Typography>
                                    )}
                                </Button>
                        </Stack>
                    </form>
                </Box>
            </Stack>
            <UploadFileModal label="photo" isOpen={isUploadFileOpen} onUploadFile={uploadProfilePhoto} onClose={() => setIsUploadFileOpen(false)} />
        </>
    );
};

export default UserForm;
