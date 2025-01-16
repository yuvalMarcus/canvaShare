import {Box, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {grey} from "@mui/material/colors";
import Button from "@mui/material/Button";
import React, {FC, MutableRefObject, useState} from "react";
import {METHOD_TYPE} from "./photo.config.ts";
import SearchModal from "./SearchModal/SearchModal.tsx";
import {Canvas, Image} from "fabric";
import {v4 as uuidv4} from "uuid";
import UploadFileModal from "../../../../../components/UploadFileModal/UploadFileModal.tsx";

interface PhotoProps {
    canvas: MutableRefObject<Canvas | null>
}

const Photo: FC<PhotoProps> = ({ canvas }) => {
    const [methodType, setMethodType] = useState<METHOD_TYPE | null>(null);
    const [isUploadFileOpen, setIsUploadFileOpen] = useState<boolean>(false);

    const uploadProfilePhoto = async (photo) => {

        const img = await Image.fromURL(photo, { crossOrigin: 'anonymous' });

        img.scaleToWidth(400);
        img.data = {
            id: uuidv4(),
            category: 'photo'
        }

        canvas.current?.add(img);
        canvas.current?.centerObject(img);
        canvas.current?.renderAll();
    }

    return (
        <>
            <Box pb={2}>
                <Typography color={grey[100]} fontSize={18} textTransform="capitalize" mb={1}>select option :</Typography>
                <Stack flexDirection="row"  gap={1}>
                    <Button variant="contained" onClick={() => {
                        setMethodType(METHOD_TYPE.UPLOAD);
                        setIsUploadFileOpen(true);
                    }}>
                        <Typography textTransform="capitalize" p={2}>upload photo</Typography>
                    </Button>
                    <Button variant="contained" onClick={() => setMethodType(METHOD_TYPE.SEARCH)}>
                        <Typography textTransform="capitalize" p={2}>search photo</Typography>
                    </Button>
                </Stack>
            </Box>
            <SearchModal canvas={canvas} isOpen={methodType === METHOD_TYPE.SEARCH} onClose={() => setMethodType(null)} />
            <UploadFileModal label="photo" isOpen={isUploadFileOpen} onUploadFile={uploadProfilePhoto} onClose={() => setIsUploadFileOpen(false)} />
        </>
    )
}

export default Photo;