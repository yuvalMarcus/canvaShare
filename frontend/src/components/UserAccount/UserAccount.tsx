import {Box, CircularProgress, Stack} from "@mui/material";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {red} from "@mui/material/colors";
import Typography from "@mui/material/Typography";
import InputText from "../Form/InputText/InputText.tsx";
import Button from "@mui/material/Button";
import {z} from "zod";
import {useAuth} from "../../context/auth.context.tsx";
import useGetUser, {GET_USER} from "../../api/hooks/user/useGetUser.ts";
import Textarea from "../Form/Textarea/Textarea.tsx";
import {UserPayload} from "../../types/user.ts";
import useUpdateUser2 from "../../api/hooks/user/useUpdateUser2.ts";
import {toast} from "react-toastify";
import {queryClient} from "../../main.tsx";
import {GET_USERS} from "../../api/hooks/user/useGetUsers.ts";
import {useParams} from "react-router-dom";
import InputTags from "../Form/InputTags/InputTags.tsx";
import {useLayoutEffect, useState} from "react";

const schema = z.object({
    username: z.string().min(4, { message: 'Required' }),
    email: z.string().email({ message: 'Email not valid' }),
    about: z.string(),
});

const UserAccount = () => {
    const [tags, setTags] = useState<string[]>([]);
    const { id: userIdParam } = useParams();

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm({
        resolver: zodResolver(schema),
    });

    const { userId } = useAuth();

    const { data: user } = useGetUser(userId);

    const handleOnSuccess = () => {
        toast.success('User uploaded successfully');
        queryClient.invalidateQueries({queryKey: [GET_USER, userIdParam]});
        queryClient.invalidateQueries({queryKey: [GET_USER, userId]});
        queryClient.invalidateQueries({queryKey: [GET_USERS]});
    }

    const handleOnError = () => {
        toast.error('User upload failed');
    }

    const { update, isPending } = useUpdateUser2({ onSuccess: handleOnSuccess, onError: handleOnError });

    const onSubmit = async (payload: UserPayload) => {

        update({ id: Number(userId), payload: {
            ...payload,
                tags
            } })
    }

    useLayoutEffect(() => {
        if(!user) return;
        setTags(user?.tags || []);
    }, [user]);

    return (
        <Box p={4} minWidth={300}>
            <Typography variant="h5" mb={4}>Account</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box>
                    <InputText label="username" name="username" defaultValue={user?.username || ''} control={control} />
                    <Typography color={red[700]} height={30}>{errors.username?.message}</Typography>
                </Box>
                <Box>
                    <InputText label="email" name="email" defaultValue={user?.email || ''} control={control} />
                    <Typography color={red[700]} height={30}>{errors.email?.message}</Typography>
                </Box>
                <Box mb={4}>
                    <InputTags tags={tags} onChange={setTags} />
                </Box>
                <Box>
                    <Textarea label="about" name="about" defaultValue={user?.about || ''} control={control} />
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