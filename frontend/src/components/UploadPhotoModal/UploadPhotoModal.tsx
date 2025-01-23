import {Box, Modal, Stack} from "@mui/material";
import {green, grey, red} from "@mui/material/colors";
import React, {FC, useLayoutEffect} from "react";
import {useDropzone} from "react-dropzone";
import {useForm} from "react-hook-form";
import Typography from "@mui/material/Typography";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import Button from "@mui/material/Button";
import {useUpload} from "../../hooks/useUpload.ts";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

const schema = z.object({
    file: z.instanceof(File)
});

const MAX_SIZE = 5000000;

const defaultAccept = {
    'image/jpeg': [],
    'image/png': []
}

interface UploadPhotoModalProps {
    isOpen: boolean;
    label?: string;
    onUploadFile: (url: string | null) => Promise<void>;
    accept?: Record<string, string[]>;
    onClose: () => void;
}

const UploadPhotoModal: FC<UploadPhotoModalProps> = ({ isOpen, label = 'photo', onUploadFile, accept = defaultAccept, onClose }) => {

    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
        multiple: false,
        accept,
        maxSize: MAX_SIZE,
    });

    const { upload, isPending } = useUpload();

    const {  handleSubmit, setValue, watch, formState: {errors} } = useForm({
        resolver: zodResolver(schema),
    });

    useLayoutEffect(() => {
        if(!acceptedFiles.length) return;
        setValue("file", acceptedFiles[0]);
    }, [acceptedFiles])

    const file = watch('file');
    const hasFileError = errors?.['file'] && !file;

    const onSubmit = async ({ file }: { file: File }) => {
        const { data } = await upload(file);
        await onUploadFile(data.photo ?? null);
        onClose();
    }

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            aria-labelledby={`upload ${label}`}
            aria-describedby={`upload ${label}`}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack gap={1} position="absolute" top="50%" left="50%" minWidth={600} p={2} bgcolor={grey[200]} border={2} borderColor={grey[900]} boxShadow={24} sx={{
                    transform: 'translate(-50%, -50%)',
                }}>
                    <Stack flexDirection="row" justifyContent="space-between">
                        <Typography textTransform="capitalize">{`upload ${label}:`}</Typography>
                        <Typography textTransform="capitalize" fontWeight="bold">max size: {MAX_SIZE / 1000000}MB</Typography>
                    </Stack>
                    <Box border="dotted" borderColor={hasFileError ? red[400] : grey[400]} bgcolor={grey[200]} textAlign="center" p={4} {...getRootProps({className: 'dropzone'})} sx={{cursor: "pointer"}}>
                        <input {...getInputProps()} />
                        <FileUploadIcon fontSize={"large"} sx={{
                            color: grey[600]
                        }} />
                        <Typography color={grey[700]}>{`Drag 'n' drop some ${label} here, or click to select ${label}`}</Typography>
                    </Box>
                    {hasFileError && <Typography color={red[700]} height={30}>Photo is required</Typography>}
                    <Box>
                        {file && (
                            <Stack direction="row" gap={1}>
                                <Typography fontWeight="bold">File: </Typography>
                                <Typography color={green[600]}>{(file as File).name}</Typography>
                            </Stack>
                        )}
                        {!file && <Typography color={grey[600]}>{`No ${label} selected to upload`}</Typography>}
                    </Box>
                    <Button variant="contained" disabled={isPending} type="submit">upload</Button>
                </Stack>
            </form>
        </Modal>
    )
}

export default UploadPhotoModal;