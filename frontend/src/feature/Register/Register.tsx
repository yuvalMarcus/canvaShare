import {useForm} from "react-hook-form";
import {z} from "zod";
import {Box, Stack, TextField} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {zodResolver} from "@hookform/resolvers/zod";
import {blueGrey, red} from "@mui/material/colors";
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';

const schema = z.object({
    username: z.string().min(4, { message: 'Required' }),
    email: z.string().email({ message: 'Email not valid' }),
    password: z.string().min(4, { message: 'Required' }),
    confirmPassword: z.string().min(4, { message: 'Required' }),
});

const Register = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    })
    const onSubmit = (data) => console.log(data)

    console.log(errors)

    return (
        <Stack alignItems='center' justifyContent='center' sx={{flex: 1}}>
            <Box p={2} borderRadius={2} minWidth={350} sx={{boxShadow: 2, backgroundColor: '#fff'}}>
                <Stack flexDirection="row" gap={2} alignItems="center" mb={4}>
                    <AppRegistrationIcon fontSize="large" />
                    <Typography variant="h4" textAlign="center" color={blueGrey.A700}>Register</Typography>
                </Stack>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box>
                        <TextField label="username" variant="outlined" fullWidth {...register("username")}  />
                        <Typography color={red[700]} height={30}>{errors.username?.message}</Typography>
                    </Box>

                    <Box>
                        <TextField label="email" variant="outlined" fullWidth {...register("email")}  />
                        <Typography color={red[700]} height={30}>{errors.email?.message}</Typography>
                    </Box>

                    <Box>
                        <TextField label="password" variant="outlined" fullWidth {...register("password")}  />
                        <Typography color={red[700]} height={30}>{errors.password?.message}</Typography>
                    </Box>

                    <Box>
                        <TextField label="confirm password" variant="outlined" fullWidth {...register("confirmPassword")}  />
                        <Typography color={red[700]} height={30}>{errors.confirmPassword?.message}</Typography>
                    </Box>

                    <Button variant="outlined" fullWidth type="submit">submit</Button>
                </form>
            </Box>
        </Stack>
    )
}

export default Register;