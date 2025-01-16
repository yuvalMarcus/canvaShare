import {Box, CircularProgress, Stack} from "@mui/material";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {red} from "@mui/material/colors";
import Typography from "@mui/material/Typography";
import InputText from "../Form/InputText/InputText.tsx";
import Button from "@mui/material/Button";
import {z} from "zod";
import {useAuth} from "../../context/auth.context.tsx";
import useGetUser from "../../api/hooks/user/useGetUser.ts";
import Textarea from "../Form/Textarea/Textarea.tsx";
import updateUser from "../../api/hooks/user/useUpdateUser.ts";
import {UserPayload} from "../../types/user.ts";

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
    } = useForm({
        resolver: zodResolver(schema),
    });

    const { userId } = useAuth();

    const { data: user } = useGetUser(userId);

    const {mutateAsync, isPending} = updateUser();

    const onSubmit = async (payload: UserPayload) => {
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
                            Update
                        </Typography>
                    )}
                </Button>
            </form>
        </Box>
    )
}

export default UserAccount;