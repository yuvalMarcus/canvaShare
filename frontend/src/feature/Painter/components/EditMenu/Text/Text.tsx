import React, {FC, MutableRefObject, useLayoutEffect, useState} from "react";
import {Canvas} from "fabric";
import {Box, IconButton, Slider, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {blue, grey} from "@mui/material/colors";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import Button from "@mui/material/Button";
import ColorPicker from "../../../../../components/ColorPicker/ColorPicker.tsx";
import {FONT_STYLE, FONT_WEIGHT, TEXT_DECORATION} from "./text.config.ts";

interface TextProps {
    canvas: MutableRefObject<Canvas | null>;
    selectedId: string | null;
    onClose: () => void;
}

const Text: FC<TextProps> = ({ canvas, selectedId, onClose }) => {
    const object = canvas.current?.getObjects().find(({data}) => data?.id === selectedId);

    const [fontWeight, setFontWeight] = useState<FONT_WEIGHT>(object?.fontWeight);
    const [textDecoration, setTextDecoration] = useState<TEXT_DECORATION>(object?.underline ? TEXT_DECORATION.UNDERLINE : TEXT_DECORATION.NONE);
    const [fontStyle, setFontStyle] = useState<FONT_STYLE>(object?.fontStyle);
    const [size, setSize] = useState<number>(object?.fontSize);
    const [color, setColor] = useState<string>(object?.fill);

    const isBold = fontWeight === FONT_WEIGHT.BOLD;
    const isUnderline = textDecoration === TEXT_DECORATION.UNDERLINE;
    const isItalic = fontStyle === FONT_STYLE.ITALIC;

    useLayoutEffect(() => {
        if (!selectedId) return;

        setFontWeight(object?.fontWeight);
        setTextDecoration(object?.underline ? TEXT_DECORATION.UNDERLINE : TEXT_DECORATION.NONE);
        setFontStyle(object?.fontStyle);
        setSize(object?.fontSize);
        setColor(object?.fill);

    }, [selectedId]);

    const handleUpdateFontWeight = () => {
        if(!object) return;

        const fw = isBold ? FONT_WEIGHT.NORMAL: FONT_WEIGHT.BOLD;

        setFontWeight(fw);

        object.set({
            fontWeight: fw,
        });
        object?.setCoords();
        canvas.current?.renderAll();
    }

    const handleUpdateTextDecoration = () => {
        if(!object) return;

        const fd = isUnderline ? TEXT_DECORATION.NONE : TEXT_DECORATION.UNDERLINE;

        setTextDecoration(fd);

        object.set({
            underline: !isUnderline,
        });
        object?.setCoords();
        canvas.current?.renderAll();
    }

    const handleUpdateFontStyle = () => {
        if(!object) return;

        const fs = isItalic ? FONT_STYLE.NORMAL : FONT_STYLE.ITALIC;

        setFontStyle(fs);

        object.set({
            fontStyle: fs,
        });
        object?.setCoords();
        canvas.current?.renderAll();
    }

    const handleUpdateSize = (event: Event, newValue: number | number[]) => {
        if(!object) return;

        const value = typeof newValue == "number" ? newValue : newValue[0];
        setSize(value);

        object.set({
            fontSize: value,
        });
        object?.setCoords();
        canvas.current?.renderAll();
    }

    const handleUpdateColor = (color: string) => {
        if(!object) return;

        setColor(color);

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
            <Button variant="contained" color={'error'} onClick={handleRemoveShape}>remove shape</Button>
        </Stack>
    )
}

export default Text;