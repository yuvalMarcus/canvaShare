import {Box, IconButton, Slider, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {grey, red} from "@mui/material/colors";
import Button from "@mui/material/Button";
import React from "react";
import {useDropzone} from "react-dropzone";
import {useForm} from "react-hook-form";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Search from "../../../../components/Search/Search.tsx";
const Photo = () => {
    const {acceptedFiles, getRootProps, getInputProps} = useDropzone({
        multiple: false,
        accept: {
            //'video/mp4': ['.mp4'],
            //'video/x-msvideo': ['.avi']
        }
    });

    const { control, handleSubmit, setValue, getValues, watch, formState: {errors}, register } = useForm({
        //resolver: yupResolver(schema),
    });

    const file = watch('file');
    const hasFileError = errors?.['file'] && !file;

    return (
        <Stack gap={2} pb={2}>
            <Box>
                <Stack flexDirection="row" alignItems="center" gap={1} mb={1}>
                    <Typography color={grey[100]} fontSize={18} textTransform="capitalize">upload photo:</Typography>
                </Stack>
                <Box border="dotted" borderColor={hasFileError ? red[400] : grey[400]} bgcolor={grey[200]} textAlign="center" p={4} {...getRootProps({className: 'dropzone'})} sx={{cursor: "pointer"}}>
                    <input {...getInputProps()} />
                    <FileUploadIcon fontSize={"large"} sx={{
                        color: grey[600]
                    }} />
                    <Typography color={grey[700]}>Drag 'n' drop some photo here, or click to select photo</Typography>
                </Box>
                <Box>
                    {file && (
                        <Stack direction="row" gap={1}>
                            <Typography fontWeight="bold">File: </Typography>
                            <Typography color={grey[600]}>{(file as File).name}</Typography>
                        </Stack>
                    )}
                    {!file && <Typography color={grey[600]}>No photos selected to translate</Typography>}
                </Box>
            </Box>
            <Box>
                <Stack flexDirection="row" alignItems="center" gap={1} mb={1}>
                    <Typography color={grey[100]} fontSize={18} textTransform="capitalize">search:</Typography>
                </Stack>
                <Search />
            </Box>
        </Stack>
    )
}

export default Photo;