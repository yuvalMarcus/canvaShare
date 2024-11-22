import {Canvas} from "fabric";
import React, {MutableRefObject, useState} from "react";
import {Box, FormControl, MenuItem, Select, Slider, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {HexColorPicker} from "react-colorful";
import {grey} from "@mui/material/colors";
import {setBrushColor, setBrushSize} from "./brushes.utils.ts";

const Brushes = ({canvas}: {canvas: MutableRefObject<Canvas | null>}) => {
    const [brush, setBrush] = useState<'pencil' | 'brush' | 'spray'>('pencil');
    const [size, setSize] = useState<number>(1);
    const [color, setColor] = useState<string>('#000000');

    return (
        <Stack gap={2} pb={2}>
            <Box>
                <Typography color={grey[800]} fontSize={18} mb={1}>Type</Typography>
                <FormControl variant="standard" fullWidth>
                    <Select
                        value={brush ?? "pencil"}
                        onChange={({target}) => setBrush(target.value)}
                    >
                        <MenuItem value="pencil">Pencil</MenuItem>
                        <MenuItem value="brush">Brush</MenuItem>
                        <MenuItem value="spray">Spray</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Box>
                <Stack flexDirection="row" alignItems="center" gap={1} mb={1}>
                    <Typography color={grey[800]} fontSize={18}>Size:</Typography>
                    <Typography color={grey[600]} fontSize={14} component="span" mt={0.5}>{size}px</Typography>
                </Stack>
                <Slider min={1} max={100} value={size} onChange={({ target }) => {
                    setSize(target.value);
                    setBrushSize(canvas.current, target.value);
                }} />
            </Box>
            <Box>
                <Stack flexDirection="row" alignItems="center" gap={1} mb={2}>
                    <Typography color={grey[800]} fontSize={18}>Color:</Typography>
                    <Box width={15} height={15} boxShadow={1} sx={{ backgroundColor: color }} />
                </Stack>
                <Box px={1}>
                    <HexColorPicker color={color} onChange={(value) => {
                        setColor(value);
                        setBrushColor(canvas.current, value);
                    }} />
                </Box>
            </Box>
        </Stack>
    )
}

export default Brushes;