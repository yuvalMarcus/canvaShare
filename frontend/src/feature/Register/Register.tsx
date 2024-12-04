import {useForm} from "react-hook-form";
import {z} from "zod";
import {Box, CircularProgress, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {zodResolver} from "@hookform/resolvers/zod";
import {green, grey, red} from "@mui/material/colors";
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import * as api from "../../api/auth.ts";
import {useMutation} from "@tanstack/react-query";
import {RegisterPayload} from "../../types/auth.ts";
import {FC} from "react";
import InputText from "../../components/Form/InputText/InputText.tsx";

const schema = z.object({
    username: z.string().min(4, { message: 'Required' }),
    email: z.string().email({ message: 'Email not valid' }),
    password: z.string().min(4, { message: 'Required' }),
    confirmPassword: z.string().min(4, { message: 'Required' }),
});

const Register: FC = () => {

    const {
        handleSubmit,
        formState: { errors },
        control
    } = useForm({
        resolver: zodResolver(schema),
    });

    const { mutateAsync, isSuccess, isPending, isError, isIdle } = useMutation({
        mutationFn: api.register
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
                {isIdle && (
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
                            <InputText label="password" name="password" control={control} />
                            <Typography color={red[700]} height={30}>{errors.password?.message}</Typography>
                        </Box>
                        <Box>
                            <InputText label="confirm password" name="confirmPassword" control={control} />
                            <Typography color={red[700]} height={30}>{errors.confirmPassword?.message}</Typography>
                        </Box>
                        <Button variant="outlined" fullWidth type="submit">submit</Button>
                    </form>
                )}
                {isPending && (
                    <Box textAlign="center">
                        <CircularProgress />
                    </Box>
                )}
                {isSuccess && (
                    <Typography color={green[700]} textTransform="capitalize">user created successfully</Typography>
                )}
                {isError && (
                    <Typography color={red[700]} textTransform="capitalize">error</Typography>
                )}
            </Box>
        </Stack>
    )
}

export default Register;