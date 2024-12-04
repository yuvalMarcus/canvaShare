import {Canvas, Path} from "fabric";
import React, {MutableRefObject, useCallback, useLayoutEffect, useState} from "react";
import {Box, FormControl, MenuItem, Select, Slider, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {green, grey} from "@mui/material/colors";
import {drawingMode, setBrushColor, setBrushSize} from "./brushes.utils.ts";
import ColorPicker from "../../../../components/ColorPicker/ColorPicker.tsx";

const Brushes = ({canvas}: {canvas: MutableRefObject<Canvas | null>}) => {
    const [brush, setBrush] = useState<'pencil' | 'brush' | 'spray'>('pencil');
    const [size, setSize] = useState<number>(1);

    useLayoutEffect(() => {

        if(canvas.current) drawingMode(canvas.current, true);

        return () => {
            if(canvas.current) drawingMode(canvas.current, false);
        }

    }, []);

    //console.log('canvas.current', canvas.current?.toJSON())

    return (
        <Stack gap={2} pb={2}>
            <Box>
                <Typography color={grey[100]} fontSize={18} mb={1}>Type</Typography>
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
                    <Typography color={grey[100]} fontSize={18}>Size:</Typography>
                    <Typography color={grey[400]} fontSize={14} component="span" mt={0.5}>{size}px</Typography>
                </Stack>
                <Slider min={1} max={100} value={size} onChange={({ target }) => {
                    setSize(target.value);
                    setBrushSize(canvas.current, target.value);
                }} />
            </Box>
            <Box>
                <Stack flexDirection="row" alignItems="center" gap={1} mb={2}>
                    <Typography color={grey[100]} fontSize={18}>Color:</Typography>
                    <ColorPicker onChange={color => setBrushColor(canvas.current, color)} />
                </Stack>
            </Box>
            <Typography color={grey[100]} textTransform="capitalize" textAlign="center" py={0.5} sx={{ backgroundColor: green[700] }}>
                draw is active
            </Typography>
        </Stack>
    )
}

export default Brushes;