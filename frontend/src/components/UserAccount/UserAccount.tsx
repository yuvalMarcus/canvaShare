import {Box, CircularProgress, Stack} from "@mui/material";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useNavigate, useParams} from "react-router-dom";
import {Bounce, toast} from "react-toastify";
import {useMutation} from "@tanstack/react-query";
import * as api from "../../api/auth.ts";
import {RegisterPayload} from "../../types/auth.ts";
import {grey, red} from "@mui/material/colors";
import Typography from "@mui/material/Typography";
import InputText from "../Form/InputText/InputText.tsx";
import Button from "@mui/material/Button";
import {z} from "zod";
import {useAuth} from "../../context/auth.context.tsx";
import useGetUser from "../../api/hooks/useGetUser.ts";
import Textarea from "../Form/Textarea/Textarea.tsx";
import * as userApi from "../../api/user.ts";

const schema = z.object({
    username: z.string().min(4, { message: 'Required' }),
    email: z.string().email({ message: 'Email not valid' }),
    about: z.string(),
});


const UserAccount = () => {
    const {
        handleSubmit,
        formState: { errors },
        control,
        setValue
    } = useForm({
        resolver: zodResolver(schema),
    });

    const { userId } = useAuth();

    const { data: user } = useGetUser(userId);

    const navigate = useNavigate();

    console.log('user', user)

    const handleOnSuccess = () => {
        toast.success('created successfully', {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
        });
        navigate("/login");
    }

    const handleOnError = (e) => {
    }

    const { mutateAsync, isSuccess, isPending, isError, isPaused, isIdle } = useMutation({
        mutationFn: userApi.updateUser,
        onSuccess: () => {},
        onError: () => {}
    })

    const onSubmit = async (payload) => {

        await mutateAsync({ id: Number(userId), payload })
    }

    return (
        <Box p={4}>
            <Typography variant="h5" mb={4}>Account</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box>
                    <InputText label="username" name="username" defaultValue={user.username} control={control} />
                    <Typography color={red[700]} height={30}>{errors.username?.message}</Typography>
                </Box>
                <Box>
                    <InputText label="email" name="email" defaultValue={user.email} control={control} />
                    <Typography color={red[700]} height={30}>{errors.email?.message}</Typography>
                </Box>
                <Box>
                    <Textarea label="about" name="about" defaultValue={user.about || ''} control={control} />
                    <Typography color={red[700]} height={30}>{errors.about?.message}</Typography>
                </Box>
                <Button variant="outlined" fullWidth type="submit" disabled={isPending}>
                    {isPending && (
                        <Stack alignItems="center" justifyContent="center">
                            <CircularProgress size={24} />
                        </Stack>
                    )}
                    {!isPending && (
                        <Typography textAlign="center">
                            update
                        </Typography>
                    )}
                </Button>
            </form>
        </Box>
    )
}

export default UserAccount;