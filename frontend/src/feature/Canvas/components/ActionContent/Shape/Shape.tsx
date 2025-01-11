import {Box, Slider, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {grey} from "@mui/material/colors";
import React, {FC, Fragment, MutableRefObject, useState} from "react";
import Button from "@mui/material/Button";
import {v4 as uuidv4} from "uuid";
import {Canvas} from "fabric";
import {DEFAULT_COLOR, DEFAULT_SIZE, mapShapeToFabricObject, mapShapeToIcon, SHAPE_TYPE} from "./shape.config.tsx";
import ColorPicker from "../../../../../components/ColorPicker/ColorPicker.tsx";

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

    const handleUpdateStroke = (color: string) => {
        setStroke(color);
    }

    const handleUpdateFill = (color: string) => {
        setFill(color);
    }

    const handleCreateShape = () => {
        const newId = uuidv4();

        const object = mapShapeToFabricObject[selectedShape](newId, fill, stroke, size);

        canvas.current?.add(object);
        canvas.current?.centerObject(object);
        canvas.current?.renderAll();

        onClose();
    }

    return (
        <Stack gap={2} pb={2}>
            <Box>
                <Typography color={grey[100]} fontSize={18} mb={1}>Shapes: </Typography>
                <Stack flexDirection="row" justifyContent="space-between">
                    {Object.values(SHAPE_TYPE).map((shape: SHAPE_TYPE) => (
                        <Fragment key={shape}>
                            {mapShapeToIcon[shape](selectedShape === shape, () => setSelectedShape(shape))}
                        </Fragment>
                    ))}
                </Stack>
            </Box>
            <Box>
                <Stack flexDirection="row" alignItems="center" gap={1} mb={1}>
                    <Typography color={grey[100]} fontSize={18}>stroke Size:</Typography>
                    <Typography color={grey[400]} fontSize={14} component="span" mt={0.5}>{size}px</Typography>
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
            <Button variant="contained" onClick={handleCreateShape}>add new shape</Button>
        </Stack>
    )
}

export default Shape;