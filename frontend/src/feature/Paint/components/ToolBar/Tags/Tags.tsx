import Button from "@mui/material/Button";
import {
    CircularProgress,
    Popover,
    Stack,
} from "@mui/material";
import React, {useState} from "react";
import {grey, red} from "@mui/material/colors";
import Typography from "@mui/material/Typography";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {TagPayload} from "../../../../../types/tags.ts";
import InputText from "../../../../../components/Form/InputText/InputText.tsx";
import {z} from "zod";
import { usePaint } from '../../../../../context/paint.context.tsx';
import {GET_TAGS} from "../../../../../api/hooks/tag/useGetTags.ts";
import useGetPaint from "../../../../../api/hooks/paint/useGetPaint.ts";
import {useParams} from "react-router-dom";
import useCreateTag2 from "../../../../../api/hooks/tag/useCreateTag2.ts";
import {queryClient} from "../../../../../main.tsx";
import {toast} from "react-toastify";
import InputTags from "../../../../../components/Form/InputTags/InputTags.tsx";

const schema = z.object({
    name: z.string().min(1, { message: 'required' }),
});

const Tags = () => {

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const { id: paintId } = useParams();

    const { data } = useGetPaint(paintId ? Number(paintId) : undefined);

    const { payload, handleUpload } = usePaint();

    const {
        getValues,
        setValue,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({resolver: zodResolver(schema),});

    const handleOnSuccess = () => {
        handleUpload('tags', [...(payload?.tags || []), getValues('name')]);
        setValue('name', '');

        queryClient.invalidateQueries({ queryKey: [GET_TAGS] });
    }

    const handleOnError = (error) => {
        let error_msg;
        if (error?.status == 422)
            error_msg = "Invalid tag";
        else
            error_msg = error?.response?.data?.detail;
        toast.error(error_msg);
    }

    const { create, isPending } = useCreateTag2({ onSuccess: handleOnSuccess, onError: handleOnError })

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = !!anchorEl;
    const id = open ? 'simple-popover' : undefined;


    const onSubmit = async (payload: TagPayload) => {
        create(payload)
    }

    return (
        <>
            <Button aria-describedby={id} onClick={handleClick} size="large" variant="text">
                <Typography color={grey[900]} textTransform="capitalize">
                    tags
                </Typography>
            </Button>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Stack width={600} p={2} gap={2}>
                    <Stack gap={1}>
                        <Typography textTransform="capitalize">select tags</Typography>
                        <InputTags tags={payload?.tags || data?.tags || []} onChange={(tags) => handleUpload('tags', tags)} />
                    </Stack>
                    <Stack gap={1}>
                        <Typography textTransform="capitalize">add tag</Typography>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Stack flexDirection="row" gap={2}>
                                <InputText label="Add new tag" name="name" control={control} />
                                <Button variant="contained" color="success" type="submit" disabled={isPending}>
                                    {isPending && (
                                        <Stack alignItems="center" justifyContent="center">
                                            <CircularProgress size={24} />
                                        </Stack>
                                    )}
                                    {!isPending && (
                                        <Typography textAlign="center">
                                            add
                                        </Typography>
                                    )}
                                </Button>
                            </Stack>
                            <Typography color={red[700]} height={30}>{errors.name?.message}</Typography>
                        </form>
                    </Stack>
                </Stack>
            </Popover>
        </>
    )
}

export default Tags;