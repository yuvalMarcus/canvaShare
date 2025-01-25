import {useForm} from "react-hook-form";
import {z} from "zod";
import {Box, CircularProgress, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {zodResolver} from "@hookform/resolvers/zod";
import {grey, red} from "@mui/material/colors";
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import {RegisterPayload} from "../../types/user.ts";
import InputText from "../../components/Form/InputText/InputText.tsx";
import useRegister from "../../api/hooks/auth/useRegister.ts";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";
import {queryClient} from "../../main.tsx";
import {GET_USERS} from "../../api/hooks/user/useGetUsers.ts";

const schema = z.object({
    username: z.string().min(4, { message: 'Required' }).toLowerCase(),
    email: z.string().email({ message: 'Email not valid' }),
    password: z.string().min(4, { message: 'Required' }),
});

const Register = () => {

    const navigate = useNavigate();

    const handleOnSuccess = () => {
        toast.success('Successfully logged in');
        navigate("/login");
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

    const { register, isPending} = useRegister({ onSuccess: handleOnSuccess, onError: handleOnError });

    const {
        handleSubmit,
        formState: { errors },
        control
    } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (payload: RegisterPayload) => {
        register(payload);

        queryClient.invalidateQueries({ queryKey: [GET_USERS] });
    }

    return (
        <Stack alignItems='center' justifyContent='center' flex={1}>
            <Box p={2} borderRadius={2} minWidth={350} boxShadow={2} bgcolor={grey[100]}>
                <Stack flexDirection="row" gap={2} alignItems="center" mb={4}>
                    <AppRegistrationIcon fontSize="large" />
                    <Typography variant="h4" textAlign="center" color={grey[700]}>Register</Typography>
                </Stack>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box>
                        <InputText label="username" name="username" control={control} />
                        <Typography color={red[700]} height={30}>{errors.username?.message}</Typography>
                    </Box>
                    <Box>
                        <InputText label="email" name="email" control={control} />
                        <Typography color={red[700]} height={30}>{errors.email?.message}</Typography>
                    </Box>
                    <Box>
                        <InputText label="password" name="password" f_type="password" control={control} />
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

export default Register;