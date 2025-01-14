import {useForm} from "react-hook-form";
import {z} from "zod";
import {Box, CircularProgress, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {zodResolver} from "@hookform/resolvers/zod";
import {blueGrey, grey, red} from "@mui/material/colors";
import LoginIcon from '@mui/icons-material/Login';
import {LoginPayload} from "../../types/auth.ts";
import InputText from "../../components/Form/InputText/InputText.tsx";
import {FC} from "react";
import {useAuth} from "../../context/auth.context.tsx";
import useLogin from "../../api/hooks/auth/useLogin.ts"

const schema = z.object({
    username: z.string().min(4, { message: 'required' }),
    password: z.string().min(4, { message: 'required' }),
});

const Login: FC = () => {
    const { setCertificate, login } = useAuth();
    const {mutateAsync: loginMutate, isPending} = useLogin();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async ({ username, password }: LoginPayload) => {
        const { data } = await loginMutate({
            username,
            password,
        });
        setCertificate(data.token, data.refreshToken, data.userId);
        login();
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
                        <InputText label="username" name="username" control={control}/>
                        <Typography color={red[700]} height={30}>{errors.username?.message}</Typography>
                    </Box>
                    <Box>
                        <InputText label="password" name="password" f_type="password" control={control}/>
                        <Typography color={red[700]} height={30}>{errors.password?.message}</Typography>
                    </Box>
                    <Button variant="outlined" fullWidth type="submit" disabled={isPending}>
                        {isPending && (
                            <Stack alignItems="center" justifyContent="center">
                                <CircularProgress size={24}/>
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