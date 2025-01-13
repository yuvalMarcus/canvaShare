import Button from "@mui/material/Button";
import {
    Autocomplete,
    CircularProgress,
    Popover,
    Stack,
    TextField
} from "@mui/material";
import React, {useState} from "react";
import {grey, red} from "@mui/material/colors";
import Typography from "@mui/material/Typography";
import * as api from "../../../../../api/tags.ts";
import {useMutation, useQuery} from "@tanstack/react-query";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Bounce, toast} from "react-toastify";
import {TagPayload} from "../../../../../types/tags.ts";
import InputText from "../../../../../components/Form/InputText/InputText.tsx";
import {z} from "zod";
import { usePaint } from '../../../../../context/paint.context.tsx';
import useGetTags, {GET_TAGS} from "../../../../../api/hooks/tag/useGetTags.ts";
import {queryClient} from "../../../../../main.tsx";
import useGetPaint from "../../../../../api/hooks/paint/useGetPaint.ts";
import {useParams} from "react-router-dom";

const schema = z.object({
    name: z.string().min(1, { message: 'required' }),
});

const Tags = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const { id: paintId } = useParams();


    const { data } = useGetPaint(paintId ? Number(paintId) : undefined);

    const { payload, handleUpload } = usePaint();

    const { data: tagsList, isPending: isPendingData } = useGetTags();

    const {
        getValues,
        setValue,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const handleOnSuccess = () => {
        const name = getValues('name');
        handleUpload('tags', [...(payload?.tags ?? []), name]);
        setValue('name', '');
        toast.success('tag add successfully', {
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

        queryClient.invalidateQueries({ queryKey: [GET_TAGS] });
    }

    const handleOnError = () => {
        toast.error('error', {
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
    }

    const { mutateAsync, isPending } = useMutation({
        mutationFn: api.createTag,
        onSuccess: handleOnSuccess,
        onError: handleOnError
    });

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = !!anchorEl;
    const id = open ? 'simple-popover' : undefined;


    const onSubmit = async ({ name }: TagPayload) => {
        await mutateAsync({
            name,
        });
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
                        {!isPendingData && (
                            <Autocomplete
                                multiple
                                id="tags-outlined"
                                value={payload.tags || data?.tags || []}
                                options={tagsList?.tags.map(({ name }) => name) || []}
                                onChange={(_, values) => handleUpload('tags', values)}
                                filterSelectedOptions
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Tags List"
                                        placeholder="Tags"
                                    />
                                )}
                            />
                        )}
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