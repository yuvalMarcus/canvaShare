import Button from "@mui/material/Button";
import {
    Popover,
    Stack, TextField
} from "@mui/material";
import React, {useState} from "react";
import {grey} from "@mui/material/colors";
import Typography from "@mui/material/Typography";
import {usePaint} from "../../../../../context/paint.context.tsx";
import useGetPaint from "../../../../../api/hooks/paint/useGetPaint.ts";
import {useParams} from "react-router-dom";

const Properties = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const { id: paintId } = useParams();

    const { data } = useGetPaint(paintId ? Number(paintId) : undefined);

    const { payload, handleUpload } = usePaint();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = !!anchorEl;
    const id = open ? 'simple-popover' : undefined;

    return (
        <>
            <Button aria-describedby={id} onClick={handleClick} size="large" variant="text">
                <Typography color={grey[900]} textTransform="capitalize">
                    properties
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
                    <Typography textTransform="capitalize">description</Typography>
                    <TextField
                        label="Description"
                        multiline
                        rows={3}
                        variant="outlined"
                        value={payload?.description || data?.description}
                        onChange={event => handleUpload('description', event.target.value)}
                    />
                </Stack>
            </Popover>
        </>
    )
}

export default Properties;