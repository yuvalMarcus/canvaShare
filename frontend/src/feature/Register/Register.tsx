import {useForm} from "react-hook-form";
import {z} from "zod";
import {Box, CircularProgress, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {zodResolver} from "@hookform/resolvers/zod";
import {grey, red} from "@mui/material/colors";
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import * as api from "../../api/auth.ts";
import {useMutation} from "@tanstack/react-query";
import {RegisterPayload} from "../../types/auth.ts";
import {FC, useState} from "react";
import InputText from "../../components/Form/InputText/InputText.tsx";
import {Bounce, toast} from "react-toastify";
import {useNavigate} from "react-router-dom";
import Alert from "@mui/material/Alert";

const schema = z.object({
    username: z.string().min(4, { message: 'Required' }),
    email: z.string().email({ message: 'Email not valid' }),
    password: z.string().min(4, { message: 'Required' }),
});

const Register: FC = () => {

    const [errorSeverity, setErrorSeverity] = useState('false');
    const [errorMessage, setErrorMessage] = useState('');

    const {
        handleSubmit,
        formState: { errors },
        control
    } = useForm({
        resolver: zodResolver(schema),
    });

    const navigate = useNavigate();

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
        let serverErrorMessage = e?.response?.data?.detail;
        if (Array.isArray(serverErrorMessage)) {
            const field = serverErrorMessage[0]?.loc[1];
            if (field) serverErrorMessage = `Invalid ${field}`;
        }
        const statusCode = e?.response?.status;
        if (statusCode && String(statusCode).startsWith("4"))
            serverErrorMessage = serverErrorMessage ? serverErrorMessage : "Error";
        else
            serverErrorMessage = "Unexpected error <br>Please try again later";
        setErrorMessage(serverErrorMessage);
        setErrorSeverity("error");
    }

    const { mutateAsync, isSuccess, isPending, isError, isIdle } = useMutation({
        mutationFn: api.register,
        onSuccess: handleOnSuccess,
        onError: handleOnError
    })

    const onSubmit = async ({ username, email, password, tags }: RegisterPayload) => {
        await mutateAsync({
            username,
            email,
            password,
            tags: tags || []
        });
    }

    return (
        <Stack alignItems='center' justifyContent='center' flex={1}>
            <Box p={2} borderRadius={2} minWidth={350} boxShadow={2} bgcolor={grey[100]}>
                <Stack flexDirection="row" gap={2} alignItems="center" mb={4}>
                    <AppRegistrationIcon fontSize="large" />
                    <Typography variant="h4" textAlign="center" color={grey[700]}>Register</Typography>
                </Stack>
                {errorMessage &&(
                    <Box sx={{ mb: 3 }}>
                        <Alert variant="outlined" severity={errorSeverity}>
                            {errorMessage}
                        </Alert>
                    </Box>
                )}
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