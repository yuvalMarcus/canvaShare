import {useForm} from "react-hook-form";
import {z} from "zod";
import {Box, Stack, TextField} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {zodResolver} from "@hookform/resolvers/zod";
import {blueGrey, red} from "@mui/material/colors";
import LoginIcon from '@mui/icons-material/Login';

const schema = z.object({
    email: z.string().email({ message: 'Required' }),
    password: z.string().min(4, { message: 'Required' }),
});

const Login = () => {

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    })
    const onSubmit = (data) => console.log(data)

    return (
        <Stack alignItems='center' justifyContent='center' sx={{flex: 1}}>
            <Box p={2} borderRadius={2} minWidth={350} sx={{boxShadow: 2, backgroundColor: '#fff'}}>
                <Stack flexDirection="row" gap={2} alignItems="center" mb={4}>
                    <LoginIcon fontSize="large" />
                    <Typography variant="h4" textAlign="center" color={blueGrey.A700}>Login</Typography>
                </Stack>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box>
                        <TextField label="email" variant="outlined" fullWidth {...register("email")}  />
                        <Typography color={red[700]} height={30}>{errors.email?.message}</Typography>
                    </Box>
                    <Box>
                        <TextField label="password" variant="outlined" fullWidth {...register("password")}  />
                        <Typography color={red[700]} height={30}>{errors.password?.message}</Typography>
                    </Box>
                    <Button variant="outlined" fullWidth type="submit">submit</Button>
                </form>
            </Box>
        </Stack>
    )
}

export default Login;