import {useForm} from "react-hook-form";
import {z} from "zod";
import {Box, CircularProgress, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {zodResolver} from "@hookform/resolvers/zod";
import {grey, red} from "@mui/material/colors";
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import {UserPayload} from "../../types/user.ts";
import {FC} from "react";
import InputText from "../../components/Form/InputText/InputText.tsx";
import useRegister from "../../api/hooks/auth/useRegister.ts";

const schema = z.object({
    username: z.string().min(4, { message: 'Required' }),
    email: z.string().email({ message: 'Email not valid' }),
    password: z.string().min(4, { message: 'Required' }),
});

const Register: FC = () => {
    const {mutateAsync: register, isPending} = useRegister();
    const {
        handleSubmit,
        formState: { errors },
        control
    } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async ({ username, email, password, tags }: UserPayload) => {
        await register({
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