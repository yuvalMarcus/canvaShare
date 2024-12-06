import {useForm} from "react-hook-form";
import {z} from "zod";
import {Box, CircularProgress, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {zodResolver} from "@hookform/resolvers/zod";
import {blueGrey, grey, red} from "@mui/material/colors";
import LoginIcon from '@mui/icons-material/Login';
import * as api from '../../api/auth.ts';
import {LoginPayload} from "../../types/auth.ts";
import InputText from "../../components/Form/InputText/InputText.tsx";
import {useMutation} from "@tanstack/react-query";
import {useAuth} from "../../hooks/useAuth.ts";
import {FC} from "react";
import {Bounce, toast} from "react-toastify";
import {useNavigate} from "react-router-dom";

const schema = z.object({
    username: z.string().min(4, { message: 'required' }),
    password: z.string().min(4, { message: 'required' }),
});

const Login: FC = () => {

    const { login } = useAuth();

    const navigate = useNavigate();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const handleOnSuccess = () => {
        toast.success('login successfully', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
        });
        navigate("/");
    }

    const handleOnError = () => {
        toast.error('error', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
        });
    }

    const { mutateAsync, isSuccess, isPending, isError, isPaused, isIdle } = useMutation({
        mutationFn: api.login,
        onSuccess: handleOnSuccess,
        onError: handleOnError
    })

    const onSubmit = async ({ username, password }: LoginPayload) => {
        const { data } = await mutateAsync({
            username,
            password,
        });

        login(data.token);
    }

    return (
        <Stack alignItems='center' justifyContent='center' sx={{flex: 1}}>
            <Box p={2} borderRadius={2} minWidth={350} boxShadow={2} bgcolor={grey[100]}>
                <Stack flexDirection="row" gap={2} alignItems="center" mb={4}>
                    <LoginIcon fontSize="large" />
                    <Typography variant="h4" textAlign="center" color={blueGrey.A700}>Login</Typography>
                </Stack>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box>
                        <InputText label="username" name="username" control={control} />
                        <Typography color={red[700]} height={30}>{errors.username?.message}</Typography>
                    </Box>
                    <Box>
                        <InputText label="password" name="password" control={control} />
                        <Typography color={red[700]} height={30}>{errors.password?.message}</Typography>
                    </Box>
                    <Button variant="outlined" fullWidth type="submit" disabled={isPending}>
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
                </form>
            </Box>
        </Stack>
    )
}

export default Login;