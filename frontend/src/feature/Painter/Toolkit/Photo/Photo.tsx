import {Box, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {grey} from "@mui/material/colors";
import Button from "@mui/material/Button";
import React, {FC, MutableRefObject, useState} from "react";
import {METHOD_TYPE} from "./photo.config.ts";
import SearchModal from "./SearchModal/SearchModal.tsx";
import {Canvas} from "fabric";

interface PhotoProps {
    canvas: MutableRefObject<Canvas | null>
}

const Photo: FC<PhotoProps> = ({ canvas }) => {
    const [methodType, setMethodType] = useState<METHOD_TYPE | null>(null);

    return (
        <>
            <Box pb={2}>
                <Typography color={grey[100]} fontSize={18} textTransform="capitalize" mb={1}>select option :</Typography>
                <Stack flexDirection="row"  gap={1}>
                    <Button variant="contained" onClick={() => setMethodType(METHOD_TYPE.UPLOAD)}>
                        <Typography textTransform="capitalize" p={2}>upload photo</Typography>
                    </Button>
                    <Button variant="contained" onClick={() => setMethodType(METHOD_TYPE.SEARCH)}>
                        <Typography textTransform="capitalize" p={2}>search photo</Typography>
                    </Button>
                </Stack>
            </Box>
            <SearchModal canvas={canvas} isOpen={methodType === METHOD_TYPE.SEARCH} onClose={() => setMethodType(null)} />
        </>
    )
}

export default Photo;