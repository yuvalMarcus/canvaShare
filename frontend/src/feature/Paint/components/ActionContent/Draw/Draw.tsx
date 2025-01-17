import {Canvas} from "fabric";
import React, {FC, MutableRefObject, useLayoutEffect, useState} from "react";
import {Box, FormControl, IconButton, MenuItem, Select, SelectChangeEvent, Slider, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {blue, green, grey} from "@mui/material/colors";
import {drawingMode, setActionType, setBrushColor, setBrushSize} from "./draw.utils.ts";
import {DRAW_TYPE, mapDrawTypeToIcon} from "./draw.config.ts";
import {backgroundColor} from "@eslint/js";
import Button from "@mui/material/Button";
import ColorPicker from "../../../../../components/ColorPicker/ColorPicker.tsx";

export const DEFAULT_SIZE = 10;
export const DEFAULT_COLOR = '#000000';

interface DrawProps {
    canvas: MutableRefObject<Canvas | null>
}

const Draw: FC<DrawProps> = ({canvas}) => {
    const [selectedType, setSelectedType] = useState<DRAW_TYPE>(DRAW_TYPE.PENCIL);
    const [size, setSize] = useState<number>(DEFAULT_SIZE);
    const [color, setColor] = useState<string>(DEFAULT_COLOR);

    useLayoutEffect(() => {
        if(canvas.current) drawingMode(canvas.current, true);

        return () => {
            if(canvas.current) drawingMode(canvas.current, false);
        }
    }, []);

    const handleUpdateType = (value: DRAW_TYPE) => {
        setSelectedType(value);
        setActionType(canvas.current, value);
    }

    const handleUpdateSize = (event: Event, newValue: number | number[]) => {
        const value = typeof newValue == "number" ? newValue : newValue[0];
        setSize(value);
        setBrushSize(canvas.current, value);
    }

    const handleUpdateColor = (color: string) => {
        setColor(color);
        setBrushColor(canvas.current, color);
    }

    return (
        <Stack gap={2} pb={2}>
            <Box>
                <Typography color={grey[100]} fontSize={18} mb={1}>Type</Typography>
                <FormControl variant="standard" fullWidth>
                    <Stack flexDirection="row" justifyContent="space-between">
                        {Object.values(DRAW_TYPE).map((value) => {

                            const Icon = mapDrawTypeToIcon[value];

                            return (
                                <Button key={value} onClick={() => handleUpdateType(value as DRAW_TYPE)}>
                                    <Stack alignItems="center">
                                        <Icon sx={{ color: selectedType === value ? blue[300] : grey[100] }} />
                                        <Typography fontSize='medium' textTransform="capitalize" color={selectedType === value ? blue[300] : grey[100]}>{value}</Typography>
                                    </Stack>
                                </Button>
                            )
                        })}
                    </Stack>
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
                <ColorPicker color={color} onChange={handleUpdateColor} />
            </Stack>
            <Typography color={grey[100]} textTransform="capitalize" textAlign="center" py={0.5} sx={{ backgroundColor: green[700] }}>
                drawing
            </Typography>
        </Stack>
    )
}

export default Draw;