import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar, Box, Checkbox, CircularProgress, Container, FormControlLabel, IconButton, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { grey, red } from "@mui/material/colors";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import * as api from "../../../api/auth.ts";
import { useMutation } from "@tanstack/react-query";
import { UserPayload } from "../../../types/user.ts";
import { FC, useState } from "react";
import InputText from "../../../components/Form/InputText/InputText.tsx";
import { Bounce, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";
import UploadFileModal from "../../../components/UploadFileModal/UploadFileModal.tsx";

const schema = z.object({
    username: z.string().min(4, { message: "Required" }),
    email: z.string().email({ message: "Email not valid" }),
    password: z.string().min(4, { message: "Required" }),
});

const CreateUser: FC = () => {

    const [errorSeverity, setErrorSeverity] = useState("error");
    const [errorMessage, setErrorMessage] = useState("");
    const [isUploadFileOpen, setIsUploadFileOpen] = useState<boolean>(false);
    const [uploadType, setUploadType] = useState<'profile' | 'cover' | null>(null);

    const {
        handleSubmit,
        formState: { errors },
        control,
        setValue
    } = useForm({
        resolver: zodResolver(schema),
    });

    const navigate = useNavigate();

    const handleOnSuccess = () => {
        toast.success("User created successfully", {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            transition: Bounce,
        });
        navigate("/admin");
    };

    const handleOnError = (e) => {
        let serverErrorMessage = e?.response?.data?.detail;
        if (Array.isArray(serverErrorMessage)) {
            const field = serverErrorMessage[0]?.loc[1];
            if (field) serverErrorMessage = `Invalid ${field}`;
        }
        serverErrorMessage =
            serverErrorMessage || "Unexpected error. Please try again later.";
        setErrorMessage(serverErrorMessage);
        setErrorSeverity("error");
    };

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.register,
        onSuccess: handleOnSuccess,
        onError: handleOnError,
    });

    const onSubmit = async ({ username, email, password, about, roles, photo }: UserPayload) => {
        await mutateAsync({
            username,
            email,
            password,
            about,
            roles,
            photo
        });
    };

    const uploadProfilePhoto = async (photo) => {
        setValue("profile_photo",photo)
    }

    return (
        <>
        <Stack>
            <Stack alignItems="center" justifyContent="center" flex={1}>
                <Box
                    p={2}
                    borderRadius={2}
                    minWidth={350}
                    boxShadow={2}
                    bgcolor={grey[100]}
                    sx={{ position: "relative" }}
                >
                    <Stack flexDirection="row" gap={2} alignItems="center" mb={4}>
                        <AppRegistrationIcon fontSize="large" />
                        <Typography variant="h4" textAlign="center" color={grey[700]}>
                            Create User
                        </Typography>
                        <Container sx={{ height: '100%', position: "relative", zIndex: 10 ,}}>
                            <Box position="absolute" top={-50} left="50%" sx={{ transform: "translateX(-50%)" }}>
                                <Avatar
                                    alt="Remy Sharp"
                                    sx={{ width: 100, height: 100, boxShadow: 4, backgroundColor: grey[100] }}
                                />
                                <Box position="absolute" top={0} right={0} zIndex={10} bgcolor={grey[100]} borderRadius="100%" boxShadow={1}>
                                    <IconButton onClick={() => {
                                        setUploadType('profile')
                                        setIsUploadFileOpen(true);
                                    }}>
                                        <EditIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Container>
                    </Stack>

                    {errorMessage && (
                        <Box sx={{ mb: 3 }}>
                            <Alert variant="outlined" severity={errorSeverity}>
                                {errorMessage}
                            </Alert>
                        </Box>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Box>
                            <InputText label="Username" name="username" control={control} />
                            <Typography color={red[700]} height={30}>
                                {errors.username?.message}
                            </Typography>
                        </Box>
                        <Box>
                            <InputText label="Email" name="email" control={control} />
                            <Typography color={red[700]} height={30}>
                                {errors.email?.message}
                            </Typography>
                        </Box>
                        <Box>
                            <InputText
                                label="Password"
                                name="password"
                                f_type="password"
                                control={control}
                            />
                            <Typography color={red[700]} height={30}>
                                {errors.password?.message}
                            </Typography>
                        </Box>
                        <Box>
                            <InputText label="About" name="about" control={control} />
                        </Box>
                        <Box mt={0.5}>
                            <Typography variant="h6" color={grey[700]}>
                                Select user roles
                            </Typography>
                            <Box display="block" mb={0.5}>
                                <FormControlLabel
                                    control={<Checkbox />}
                                    label="User view"
                                    onChange={(e) => setValue("roles", [...(e.target.checked ? ["User_view"] : []), ...roles])}
                                />
                            </Box>
                            <Box display="block" mb={0.5}>
                                <FormControlLabel
                                    control={<Checkbox />}
                                    label="User management"
                                    onChange={(e) => setValue("roles", [...(e.target.checked ? ["User_management"] : []), ...roles])}
                                />
                            </Box>
                            <Box display="block" mb={0.5}>
                                <FormControlLabel
                                    control={<Checkbox />}
                                    label="Paint view"
                                    onChange={(e) => setValue("roles", [...(e.target.checked ? ["Paint_view"] : []), ...roles])}
                                />
                            </Box>
                            <Box display="block" mb={0.5}>
                                <FormControlLabel
                                    control={<Checkbox />}
                                    label="Paint management"
                                    onChange={(e) => setValue("roles", [...(e.target.checked ? ["Paint_management"] : []), ...roles])}
                                />
                            </Box>
                            <Box display="block" mb={0.5}>
                                <FormControlLabel
                                    control={<Checkbox />}
                                    label="Report view"
                                    onChange={(e) => setValue("roles", [...(e.target.checked ? ["Report_view"] : []), ...roles])}
                                />
                            </Box>
                            <Box display="block" mb={0.5}>
                                <FormControlLabel
                                    control={<Checkbox />}
                                    label="Report management"
                                    onChange={(e) => setValue("roles", [...(e.target.checked ? ["Report_management"] : []), ...roles])}
                                />
                            </Box>
                            <Box display="block" mb={0.5}>
                                <FormControlLabel
                                    control={<Checkbox />}
                                    label="Roles view"
                                    onChange={(e) => setValue("roles", [...(e.target.checked ? ["Roles_view"] : []), ...roles])}
                                />
                            </Box>
                            <Box display="block" mb={0.5}>
                                <FormControlLabel
                                    control={<Checkbox />}
                                    label="Roles management"
                                    onChange={(e) => setValue("roles", [...(e.target.checked ? ["Roles_management"] : []), ...roles])}
                                />
                            </Box>
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
        </Stack>
        <UploadFileModal label="photo" isOpen={isUploadFileOpen} onUploadFile={uploadProfilePhoto} onClose={() => setIsUploadFileOpen(false)} />
    </>
    );
};

export default CreateUser;
