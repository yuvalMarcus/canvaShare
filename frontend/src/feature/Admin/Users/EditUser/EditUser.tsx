import {Controller, useForm} from "react-hook-form";
import { z } from "zod";
import {
    Avatar,
    Box,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    FormGroup,
    IconButton,
    Stack
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import {grey, red} from "@mui/material/colors";
import {useState} from "react";
import InputText from "../../../../components/Form/InputText/InputText.tsx";
import EditIcon from "@mui/icons-material/Edit";
import UploadPhotoModal from "../../../../components/UploadPhotoModal/UploadPhotoModal.tsx";
import Textarea from "../../../../components/Form/Textarea/Textarea.tsx";
import useGetUser from "../../../../api/hooks/user/useGetUser.ts";
import {useNavigate, useParams} from "react-router-dom";
import Permissions from "../../../../components/Permissions/Permissions.tsx";
import {toast} from "react-toastify";
import {queryClient} from "../../../../main.tsx";
import {GET_USERS} from "../../../../api/hooks/user/useGetUsers.ts";
import useUpdateUser from "../../../../api/hooks/user/useUpdateUser.ts";

const roles = [
    'admin_view',
    'user_view',
    'user_management',
    'paint_view',
    'paint_management',
    'report_view',
    'report_management',
    'tag_view',
    'tag_management',
    'roles_view',
    'roles_management']

const schema = z.object({
    username: z.string().min(4, { message: "Required" }),
    password: z.string()
        .min(6, { message: 'min length 6' })
        .regex(new RegExp(".*[a-zA-Z].*"), "One character")
        .regex(new RegExp(".*\\d.*"), "One number"),
    email: z.string().email({ message: "Email not valid" }),
    about: z.string().max(80, { message: 'Description value is to mach' }).optional(),
    ...roles.reduce((prev, role) => {
        prev[role] = z.any();
        return prev;
    }, {})
});

const EditUser = () => {
    const [isUploadFileOpen, setIsUploadFileOpen] = useState<boolean>(false);

    const { id: userId } = useParams();
    const { data: user, isPending: getIsPending } = useGetUser(Number(userId) ?? null);
    const navigate  = useNavigate();

    const {
        handleSubmit,
        control,
        formState: { errors },
        watch
    } = useForm({
        resolver: zodResolver(schema),
    });

    const handleOnSuccess = () => {
        queryClient.invalidateQueries({queryKey: [GET_USERS]});
        navigate(-1);
    }

    const handleOnError = (error) => {
        let error_msg;
        if (error?.status == 422){
            const field = error?.response?.data?.detail[0].loc[1]
            error_msg = `Invalid ${field}`;
        }
        else
            error_msg = error?.response?.data?.detail;
        toast.error(error_msg);
    }

    const { update, isPending } = useUpdateUser({ onSuccess: handleOnSuccess, onError: handleOnError });

    const onSubmit = async (payload) => {

        const newRoles = roles.filter((role) => !!payload[role]);

        const updateUserPayload = {
            username: payload.username,
            email: payload.email,
            password: payload.password,
            about: payload.about,
            roles: newRoles,
            profilePhoto
        }

        if (payload.password !== '********') updateUserPayload['password'] = payload.password;

        update({
            id: userId,
            payload: updateUserPayload
        })
    };

    const uploadProfilePhoto = async (profilePhoto: string|null) => {
        //setValue("profilePhoto", profilePhoto);
        //if (user) user.profilePhoto = profilePhoto;
    }

    const userRoles = roles.reduce((prev, role) => {
        prev[role] =  !!user?.roles?.includes(role);
        return prev;
    }, {});

    const profilePhoto = watch('profilePhoto');

    return (
        <>
            <Stack alignItems="center" justifyContent="center" flex={1}>
                <Box
                    p={2}
                    borderRadius={2}
                    maxWidth={600}
                    boxShadow={2}>
                    <Stack flexDirection="column" mt={2}>
                        <Stack alignItems="center" justifyContent="center" pb={2}>
                            <Typography variant="h4" >
                                {!userId && <>Add User</> || <>Edit User</>}
                            </Typography>
                        </Stack>
                        <Stack alignItems="center" justifyContent="center" flexDirection='row' pb={2}>
                            <Box position='relative' left={20}>
                                <Avatar alt="Remy Sharp"
                                        sx={{ width: 100, height: 100, boxShadow: 4}}
                                        src={profilePhoto ?? user?.profilePhoto} />
                            </Box>
                            <Box position="relative" width={40} bottom={30} right={10} zIndex={10} bgcolor={grey[100]} borderRadius={'100%'} boxShadow={1}>
                                <IconButton onClick={() => setIsUploadFileOpen(true)}>
                                    <EditIcon />
                                </IconButton>
                            </Box>
                        </Stack>
                    </Stack>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack alignItems="center" justifyContent="center" gap={1}>
                            <Box width="100%">
                                <InputText label="username" name="username" defaultValue={user?.username} control={control}/>
                                <Typography color={red[700]} height={30}>{errors.username?.message}</Typography>
                            </Box>
                            <Box width="100%">
                                <InputText label="email" name="email" f_type="email" defaultValue={user?.email} control={control}/>
                                <Typography color={red[700]} height={30}>{errors.email?.message}</Typography>
                            </Box>
                            <Box width="100%">
                                <InputText label="password" name="password" f_type="text" defaultValue='********' control={control}/>
                                <Typography color={red[700]} height={30}>{errors.password?.message}</Typography>
                            </Box>
                            <Box width="100%">
                                <Textarea label="about" name="about" f_type="about" defaultValue={user?.about} control={control}/>
                                <Typography color={red[700]} height={30}>{errors.about?.message}</Typography>
                            </Box>
                            <Permissions roles={[]}>
                                <Box width="100%">
                                    <Typography variant="h6" color={grey[700]}>
                                        Select user roles
                                    </Typography>
                                    <Stack flexDirection="row" flex={1}>
                                        <FormGroup>
                                            <Stack flexDirection="row" flexWrap="wrap">
                                                {roles.map(role => (
                                                    <Box width="50%">
                                                        <Controller
                                                            control={control}
                                                            name={role}
                                                            render={({ field }) => (
                                                                <FormControlLabel
                                                                    {...field}
                                                                    control={<Checkbox defaultChecked={userRoles[role]} />}
                                                                    label={<Typography textTransform="capitalize">{role.replaceAll('_', ' ')}</Typography>} />
                                                            )}
                                                        />
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </FormGroup>
                                    </Stack>
                                </Box>
                            </Permissions>
                            <Button variant="outlined" type="submit" disabled={isPending}>
                                {isPending && (
                                    <Stack alignItems="center" justifyContent="center">
                                        <CircularProgress size={24} />
                                    </Stack>
                                )}
                                {!isPending && (
                                    <Typography textAlign="center">
                                        submit
                                    </Typography>
                                )}
                            </Button>
                        </Stack>
                    </form>
                </Box>
            </Stack>
            <UploadPhotoModal label="photo" isOpen={isUploadFileOpen} onUploadFile={uploadProfilePhoto} onClose={() => setIsUploadFileOpen(false)} />
        </>
    );
};

export default EditUser;
