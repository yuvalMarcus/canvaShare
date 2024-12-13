import Button from "@mui/material/Button";
import {
    Popover,
    Stack
} from "@mui/material";
import React, {useState} from "react";
import {grey} from "@mui/material/colors";
import Typography from "@mui/material/Typography";

const Properties = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

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
                    <Button variant="contained">Save</Button>
                </Stack>
            </Popover>
        </>
    )
}

export default Properties;