import {Box, Slider, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {grey} from "@mui/material/colors";
import React, {FC, MutableRefObject, useState} from "react";
import Button from "@mui/material/Button";
import {v4 as uuidv4} from "uuid";
import {Canvas} from "fabric";
import {getCircle, getRectangle, getSquare, getTriangular} from "./shape.utils.ts";
import ColorPicker from "../../../../components/ColorPicker/ColorPicker.tsx";
import {DEFAULT_COLOR, DEFAULT_SIZE, mapShapeToIcon, SHAPE_TYPE} from "./shape.config.tsx";

interface ShapeProps {
    canvas: MutableRefObject<Canvas | null>;
    onClose: () => void;
}

const Shape: FC<ShapeProps> = ({ canvas, onClose }) => {
    const [selectedShape, setSelectedShape] = useState<SHAPE_TYPE>(SHAPE_TYPE.SQUARE);
    const [size, setSize] = useState<number>(DEFAULT_SIZE);
    const [stroke, setStroke] = useState<string>(DEFAULT_COLOR);
    const [fill, setFill] = useState<string>(DEFAULT_COLOR);

    const handleUpdateSize = (event: Event, newValue: number | number[]) => {
        const value = typeof newValue == "number" ? newValue : newValue[0];
        setSize(value);
    }

    const handleCreateShape = () => {
        const newId = uuidv4();

        const o1 = {
            square: getSquare,
            circle: getCircle,
            rectangle: getRectangle,
            triangular: getTriangular
        }

        const item = o1[selectedShape](newId, fill, stroke, size);

        canvas.current?.add(item);

        canvas.current?.centerObject(item);

        canvas.current?.renderAll();

        onClose();
    }

    return (
        <Stack gap={2} pb={2}>
            <Box>
                <Typography color={grey[100]} fontSize={18} mb={1}>Shapes: </Typography>
                <Stack flexDirection="row" justifyContent="space-between">
                    {Object.values(SHAPE_TYPE).map((shape: SHAPE_TYPE) => mapShapeToIcon[shape](selectedShape === shape, () => setSelectedShape(shape)))}
                </Stack>
            </Box>
            <Box>
                <Stack flexDirection="row" alignItems="center" gap={1} mb={1}>
                    <Typography color={grey[100]} fontSize={18}>stroke Size:</Typography>
                    <Typography color={grey[400]} fontSize={14} component="span" mt={0.5}>{size}px</Typography>
                </Stack>
                <Slider min={1} max={100} value={size} onChange={handleUpdateSize} />
            </Box>
            <Stack position="relative" flexDirection="row" alignItems="center" gap={1} mb={2}>
                <Typography color={grey[100]} fontSize={18}>Stroke:</Typography>
                <ColorPicker onChange={color => setStroke(color)} />
            </Stack>
            <Stack flexDirection="row" alignItems="center" gap={1} mb={2}>
                <Typography color={grey[100]} fontSize={18}>Fill:</Typography>
                <ColorPicker onChange={color => setFill(color)} />
            </Stack>
            <Button variant="contained" onClick={handleCreateShape}>add new shape</Button>
        </Stack>
    )
}

export default Shape;