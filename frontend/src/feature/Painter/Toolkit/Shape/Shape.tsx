import {Box, FormControl, IconButton, MenuItem, Popover, Select, Slider, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {blue, grey} from "@mui/material/colors";
import {setBrushColor, setBrushSize} from "../Brushes/brushes.utils.ts";
import {HexColorPicker} from "react-colorful";
import React, {MutableRefObject, useState} from "react";
import CropSquareIcon from '@mui/icons-material/CropSquare';
import Crop32Icon from '@mui/icons-material/Crop32';
import Button from "@mui/material/Button";
import {v4 as uuidv4} from "uuid";
import {Canvas, IText, Rect} from "fabric";
import {setTextSize} from "../Text/text.utils.ts";
import {getCircle, getRectangle, getSquare, getTriangular} from "./shape.utils.ts";
import ColorPicker from "../../../../components/ColorPicker/ColorPicker.tsx";

interface ShapeProps {
    canvas: MutableRefObject<Canvas | null>;
    onClose: () => void;
}

const Shape = ({ canvas, onClose }: ShapeProps) => {
    const [shapeType, setShapeType] = useState<'square' | 'circle' | 'rectangle' | 'triangular' | null>(null);
    const [stroke, setStroke] = useState<string>('#000000');
    const [fill, setFill] = useState<string>('#000000');
    const [size, setSize] = useState<number>(1);

    const handleCreateText = () => {
        const newId = uuidv4();

        const o1 = {
            square: getSquare,
            circle: getCircle,
            rectangle: getRectangle,
            triangular: getTriangular
        }

        const item = o1[shapeType](newId, fill, stroke, size);

        canvas.current?.add(item);

        canvas.current?.centerObject(item);

        canvas.current?.renderAll();

        onClose();
    }

    return (
        <Stack gap={2} pb={2}>
            <Box>
                <Typography color={grey[800]} fontSize={18} mb={1}>Shapes: </Typography>
                <Stack flexDirection="row" justifyContent="space-between">
                    <IconButton onClick={() => setShapeType('square')}>
                        <Box sx={{
                            height: 25,
                            width: 25,
                            backgroundColor: shapeType === 'square' ? blue[300] : grey[300]
                        }} />
                    </IconButton>
                    <IconButton onClick={() => setShapeType('circle')}>
                        <Box sx={{   height: 25,
                            width: 25,
                            borderRadius: 25,
                            backgroundColor: shapeType === 'circle' ? blue[300] : grey[300] }} />
                    </IconButton>
                    <IconButton onClick={() => setShapeType('rectangle')}>
                        <Box sx={{   height: 25,
                            width: 50,
                            backgroundColor: shapeType === 'rectangle' ? blue[300] : grey[300] }} />
                    </IconButton>
                    <IconButton onClick={() => setShapeType('triangular')}>
                        <Box sx={{	width: 0,
                            height: 0,
                            borderLeft: '12.5px solid transparent',
                            borderRight: '12.5px solid transparent',
                            borderBottom: '25px solid ' + (shapeType === 'triangular' ? blue[300] : grey[300]),
                        }}></Box>
                    </IconButton>
                </Stack>
            </Box>
            <Box>
                <Stack flexDirection="row" alignItems="center" gap={1} mb={1}>
                    <Typography color={grey[100]} fontSize={18}>stroke Size:</Typography>
                    <Typography color={grey[400]} fontSize={14} component="span" mt={0.5}>{size}px</Typography>
                </Stack>
                <Slider min={1} max={100} value={size} onChange={({ target }) => {
                    setSize(target.value);
                }} />
            </Box>
            <Box>
                <Stack position="relative" flexDirection="row" alignItems="center" gap={1} mb={2}>
                    <Typography color={grey[100]} fontSize={18}>Stroke:</Typography>
                    <ColorPicker onChange={color => setStroke(color)} />
                </Stack>
            </Box>
            <Box>
                <Stack flexDirection="row" alignItems="center" gap={1} mb={2}>
                    <Typography color={grey[100]} fontSize={18}>Fill:</Typography>
                    <ColorPicker onChange={color => setFill(color)} />
                </Stack>
            </Box>
            <Button variant="contained" onClick={handleCreateText}>add new shape</Button>
        </Stack>
    )
}

export default Shape;