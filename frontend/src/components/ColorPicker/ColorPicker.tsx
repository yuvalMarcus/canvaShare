import { Box, Popover } from "@mui/material";
import {HexColorPicker} from "react-colorful";
import React, {FC} from "react";
import Button from "@mui/material/Button";

interface ColorPickerProps {
    color: string;
    onChange: (color: string)=> void;
}

const ColorPicker:FC<ColorPickerProps> = ({ color, onChange }) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

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
            <Button aria-describedby={id} onClick={handleClick} sx={{ backgroundColor: color, width: 15, height: 15, boxShadow: 1 }} />
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
                <Box p={2}>
                    <HexColorPicker color={color} onChange={onChange} />
                </Box>
            </Popover>
        </>
    )
}

export default ColorPicker;