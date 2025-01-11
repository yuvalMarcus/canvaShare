import React, {FC, MutableRefObject, useState} from "react";
import {Canvas, IText} from "fabric";
import { v4 as uuidv4 } from 'uuid';
import {Box, IconButton, Slider, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {blue, grey} from "@mui/material/colors";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import Button from "@mui/material/Button";
import {DEFAULT_COLOR, DEFAULT_SIZE, FONT_STYLE, FONT_WEIGHT, TEXT_DECORATION} from "./text.config.ts";
import ColorPicker from "../../../../../components/ColorPicker/ColorPicker.tsx";

interface TextProps {
    canvas: MutableRefObject<Canvas | null>;
    onClose: () => void;
}

const Text: FC<TextProps> = ({ canvas, onClose }) => {
    const [fontWeight, setFontWeight] = useState<FONT_WEIGHT>(FONT_WEIGHT.NORMAL);
    const [textDecoration, setTextDecoration] = useState<TEXT_DECORATION>(TEXT_DECORATION.NONE);
    const [fontStyle, setFontStyle] = useState<FONT_STYLE>(FONT_STYLE.NORMAL);
    const [size, setSize] = useState<number>(DEFAULT_SIZE);
    const [color, setColor] = useState<string>(DEFAULT_COLOR);

    const isBold = fontWeight === FONT_WEIGHT.BOLD;
    const isUnderline = textDecoration === TEXT_DECORATION.UNDERLINE;
    const isItalic = fontStyle === FONT_STYLE.ITALIC;

    const handleUpdateFontWeight = () => {
        setFontWeight(isBold ? FONT_WEIGHT.NORMAL: FONT_WEIGHT.BOLD);
    }

    const handleUpdateTextDecoration = () => {
        setTextDecoration(isUnderline ? TEXT_DECORATION.NONE : TEXT_DECORATION.UNDERLINE);
    }

    const handleUpdateFontStyle = () => {
        setFontStyle(isItalic ? FONT_STYLE.NORMAL : FONT_STYLE.ITALIC);
    }

    const handleUpdateSize = (event: Event, newValue: number | number[]) => {
        const value = typeof newValue == "number" ? newValue : newValue[0];
        setSize(value);
    }

    const handleUpdateColor = (color: string) => {
        setColor(color);
    }

    const handleCreateText = () => {
        const newId = uuidv4();

        const newText = new IText('Text', {
            textAlign: 'center',
            fontSize: size,
            fill: color,
            editable: true,
            fontWeight,
            underline: isUnderline,
            fontStyle,
            data: {
                id: newId,
                category: 'text',
            }
        });

        canvas.current?.add(newText);

        canvas.current?.centerObject(newText);

        canvas.current?.renderAll();

        onClose();
    }

    return (
        <Stack gap={2} pb={2}>
            <Box>
                <Stack flexDirection="row" alignItems="center" gap={1} mb={1}>
                    <Typography color={grey[100]} fontSize={18} textTransform="capitalize">font style:</Typography>
                </Stack>
                <Stack flexDirection="row" justifyContent="space-between" gap={1}>
                    <IconButton type="button" onClick={handleUpdateFontWeight} sx={{ color: isBold ? blue[300] : grey[100] }}>
                        <FormatBoldIcon />
                    </IconButton>
                    <IconButton type="button" onClick={handleUpdateTextDecoration} sx={{ color: isUnderline ? blue[300] : grey[100] }}>
                        <FormatUnderlinedIcon />
                    </IconButton>
                    <IconButton type="button" onClick={handleUpdateFontStyle} sx={{ color: isItalic ? blue[300] : grey[100] }}>
                        <FormatItalicIcon />
                    </IconButton>
                </Stack>
            </Box>
            <Box>
                <Stack flexDirection="row" alignItems="center" gap={1} mb={1}>
                    <Typography color={grey[100]} fontSize={18}>Size:</Typography>
                    <Typography color={grey[400]} fontSize={14} component="span" mt={0.5}>{size}px</Typography>
                </Stack>
                <Slider min={14} max={200} value={size} onChange={handleUpdateSize} />
            </Box>
            <Stack flexDirection="row" alignItems="center" gap={1} mb={2}>
                <Typography color={grey[100]} fontSize={18}>Color:</Typography>
                <ColorPicker color={color} onChange={handleUpdateColor} />
            </Stack>
            <Button variant="contained" onClick={handleCreateText}>add new text</Button>
        </Stack>
    )
}

export default Text;