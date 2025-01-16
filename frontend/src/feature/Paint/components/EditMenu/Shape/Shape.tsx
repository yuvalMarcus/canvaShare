import {Box, Slider, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {grey} from "@mui/material/colors";
import React, {FC, MutableRefObject, useLayoutEffect, useState} from "react";
import Button from "@mui/material/Button";
import {Canvas} from "fabric";
import ColorPicker from "../../../../../components/ColorPicker/ColorPicker.tsx";

interface ShapeProps {
    canvas: MutableRefObject<Canvas | null>;
    selectedId: string | null;
    onClose: () => void;
}

const Shape: FC<ShapeProps> = ({ canvas, selectedId, onClose }) => {
    const object = canvas.current?.getObjects().find(({data}) => data?.id === selectedId);

    const [size, setSize] = useState<number>(object?.strokeWidth);
    const [stroke, setStroke] = useState<string>(object?.stroke);
    const [fill, setFill] = useState<string>(object?.fill);

    useLayoutEffect(() => {
        if (!selectedId) return;

        setSize(object?.strokeWidth);
        setStroke(object?.stroke);
        setFill(object?.fill);

    }, [selectedId]);

    const handleUpdateSize = (event: Event, newValue: number | number[]) => {
        if(!object) return;

        const value = typeof newValue == "number" ? newValue : newValue[0];

        setSize(value);

        object.set({
            strokeWidth: value,
        });
        object?.setCoords();
        canvas.current?.renderAll();
    }

    const handleUpdateStroke = (color: string) => {
        if(!object) return;

        setStroke(color);

        object.set({
            stroke: color,
        });
        object?.setCoords();
        canvas.current?.renderAll();
    }

    const handleUpdateFill = (color: string) => {
        if(!object) return;

        setFill(color);

        object.set({
            fill: color,
        });
        object?.setCoords();
        canvas.current?.renderAll();
    }

    const handleRemoveShape = () => {
        if(!object) return;

        canvas.current?.remove(object);
        canvas.current?.renderAll();
    }

    return (
        <Stack gap={2} pb={2}>
            <Box>
                <Stack flexDirection="row" alignItems="center" gap={1} mb={1}>
                    <Typography color={grey[100]} fontSize={18}>stroke Size:</Typography>
                    <Typography color={grey[400]} fontSize={14} component="span" mt={0.5}>{object?.strokeWidth}px</Typography>
                </Stack>
                <Slider min={0} max={100}  value={size} onChange={handleUpdateSize} />
            </Box>
            <Stack position="relative" flexDirection="row" alignItems="center" gap={1} mb={2}>
                <Typography color={grey[100]} fontSize={18}>Stroke:</Typography>
                <ColorPicker color={stroke} onChange={handleUpdateStroke} />
            </Stack>
            <Stack flexDirection="row" alignItems="center" gap={1} mb={2}>
                <Typography color={grey[100]} fontSize={18}>Fill:</Typography>
                <ColorPicker color={fill} onChange={handleUpdateFill} />
            </Stack>
            <Button variant="contained" color={'error'} onClick={handleRemoveShape}>remove shape</Button>
        </Stack>
    )
}

export default Shape;