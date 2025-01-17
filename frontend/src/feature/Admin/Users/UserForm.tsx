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

const schema = z.object({
    username: z.string().min(4, { message: "Required" }),
    email: z.string().email({ message: "Email not valid" })
});

const UserForm = ({userId}: {userId?: number}) => {
    const [isUploadFileOpen, setIsUploadFileOpen] = useState<boolean>(false);
    const {mutate: createUser, isPending: createIsPending} = useCreateUser();
    const {mutate: updateUser, isPending: updateIsPending} = useUpdateUser();
    const { data: user, isPending: getIsPending } = useGetUser(userId ?? 0);

    const roles = [
        ['User table view', 'user_view'],
        ['User table management', 'user_management'],
        ['Paint table view', 'paint_view'],
        ['Paint table management', 'paint_management'],
        ['Report table view', 'report_view'],
        ['Report table management', 'report_management'],
        ['Roles_view', 'roles_view'],
        ['Roles management', 'roles_management']]

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
                                <Stack flexDirection="column" pr={5} key={'col-1'}>
                                    {roles.slice(0,4).map((role) => {
                                    return (
                                            <Box display="block" key={role[1]}>
                                                <FormControlLabel
                                                    control={<Checkbox />}
                                                    label={role[0]}
                                                    onChange={(e) => setValue("roles", [...(e.target.checked ? [role[1]] : []), ...(getValues("roles") ?? [])])}                                                />
                                            </Box>
                                    )})}
                                </Stack>
                                <Stack flexDirection="column" key={'col-2'}>
                                    {roles.slice(4,8).map((role) => {
                                        return (
                                            <Box display="block" key={role[1]}>
                                                <FormControlLabel
                                                    control={<Checkbox />}
                                                    label={role[0]}
                                                    onChange={(e) => setValue("roles", [...(e.target.checked ? [role[1]] : []), ...(getValues("roles") ?? [])])}                                                />
                                            </Box>
                                        )})}
                                </Stack>
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
