import {Canvas} from "fabric";
import React, {FC, MutableRefObject, useLayoutEffect, useState} from "react";
import {Box, FormControl, MenuItem, Select, SelectChangeEvent, Slider, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {green, grey} from "@mui/material/colors";
import {drawingMode, setBrushColor, setBrushSize} from "./draw.utils.ts";
import ColorPicker from "../../../../components/ColorPicker/ColorPicker.tsx";
import {DRAW_TYPE} from "./draw.config.ts";
import {backgroundColor} from "@eslint/js";

interface DrawProps {
    canvas: MutableRefObject<Canvas | null>
}

const Draw: FC<DrawProps> = ({canvas}) => {
    const [selectedType, setSelectedType] = useState<DRAW_TYPE>(DRAW_TYPE.PENCIL);
    const [size, setSize] = useState<number>(1);

    useLayoutEffect(() => {
        if(canvas.current) drawingMode(canvas.current, true);

        return () => {
            if(canvas.current) drawingMode(canvas.current, false);
        }
    }, []);

    const handleUpdateType = (event: SelectChangeEvent<DRAW_TYPE>) => {
        const { target: { value } } = event;
        setSelectedType(value as DRAW_TYPE);
    }

    const handleUpdateSize = (event: Event, newValue: number | number[]) => {
        const value = typeof newValue == "number" ? newValue : newValue[0];
        setSize(value);
        setBrushSize(canvas.current, value);
    }

    const handleUpdateColor = (color: string) => {
        setBrushColor(canvas.current, color);
    }

    return (
        <Stack gap={2} pb={2}>
            <Box>
                <Typography color={grey[100]} fontSize={18} mb={1}>Type</Typography>
                <FormControl variant="standard" fullWidth>
                    <Select
                        value={selectedType ?? DRAW_TYPE.PENCIL}
                        onChange={handleUpdateType}>
                        {Object.values(DRAW_TYPE).map(value => <MenuItem key={value} value={value}>
                            <Typography color={grey[100]} textTransform="capitalize">{value}</Typography>
                        </MenuItem>)}
                    </Select>
                </FormControl>
            </Box>
            <Box>
                <Stack flexDirection="row" alignItems="center" gap={1} mb={1}>
                    <Typography color={grey[100]} fontSize={18}>Size:</Typography>
                    <Typography color={grey[400]} fontSize={14} component="span" mt={0.5}>{size}px</Typography>
                </Stack>
                <Slider min={1} max={100} value={size} onChange={handleUpdateSize} />
            </Box>
            <Stack flexDirection="row" alignItems="center" gap={1} mb={2}>
                <Typography color={grey[100]} fontSize={18}>Color:</Typography>
                <ColorPicker onChange={handleUpdateColor} />
            </Stack>
            <Typography color={grey[100]} textTransform="capitalize" textAlign="center" py={0.5} sx={{ backgroundColor: green[700] }}>
                draw is active
            </Typography>
        </Stack>
    )
}

export default Draw;