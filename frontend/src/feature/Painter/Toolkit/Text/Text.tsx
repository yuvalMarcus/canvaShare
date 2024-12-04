import React, {MutableRefObject, useLayoutEffect, useState} from "react";
import {Canvas, Textbox, Text as Text2, IText} from "fabric";
import { v4 as uuidv4 } from 'uuid';
import {Box, IconButton, Slider, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {grey} from "@mui/material/colors";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import {updateFontWeight, setTextColor, setTextSize, updateTextDecoration} from "./text.utils.ts";
import Button from "@mui/material/Button";
import ColorPicker from "../../../../components/ColorPicker/ColorPicker.tsx";

interface TextProps {
    canvas: MutableRefObject<Canvas | null>;
    onClose: () => void;
    initId?: string;
}

const Text = ({ canvas, onClose, initId }: TextProps) => {
    const [id, setId]= useState<string | null>(initId ?? null);
    const [fontStyle, setFontStyle] = useState<'bold' | 'underline' | 'italic' | null>(null);
    const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');
    const [textDecoration, setTextDecoration] = useState<'none' | 'underline'>('none');
    const [size, setSize] = useState<number>(24);
    const [color, setColor] = useState<string>('#000000');

    useLayoutEffect(() => {
        /*
        if (id) return;

        const newId = uuidv4();

        console.log('newId', newId)

        const newText = new IText('Text', {id: newId, textAlign: 'center', fontSize: size, fill: color, editable: true});

        setId(newId);

        canvas.current?.add(newText);
        canvas.current?.renderAll();

         */

    }, []);

    const handleCreateText = () => {
        const newId = uuidv4();

        const newText = new IText('Text', {id: newId, textAlign: 'center', fontSize: size, fill: color, editable: true});

        canvas.current?.add(newText);

        canvas.current?.centerObject(newText);

        canvas.current?.renderAll();

        onClose();
    }

    const isBold = fontWeight === "bold";
    const isUnderline = textDecoration === "underline";

    return (
        <Stack gap={2} pb={2}>
            <Box>
                <Stack flexDirection="row" alignItems="center" gap={1} mb={1}>
                    <Typography color={grey[100]} fontSize={18} textTransform="capitalize">font style:</Typography>
                </Stack>
                <Stack flexDirection="row" justifyContent="space-between" gap={1}>
                    <IconButton type="button" color={isBold ? "primary" : "inherit"} onClick={() => {
                        const newFontWeight = isBold ? "normal" : "bold";
                        setFontWeight(newFontWeight);
                        id && updateFontWeight(canvas.current, id, newFontWeight);
                    }} sx={{ p: 1 }}>
                        <FormatBoldIcon />
                    </IconButton>
                    <IconButton type="button" color={isUnderline ? "primary" : "inherit"} onClick={() => {
                        const newTextDecoration = isUnderline ? "none" : "underline";
                        setTextDecoration(newTextDecoration);
                        id && updateTextDecoration(canvas.current, id, !isUnderline);
                    }} sx={{ p: 1 }}>
                        <FormatUnderlinedIcon />
                    </IconButton>
                    <IconButton type="button" onClick={() => setFontStyle(prev => prev !== "italic" ? "italic": null)} sx={{ p: 1 }}>
                        <FormatItalicIcon />
                    </IconButton>
                </Stack>
            </Box>
            <Box>
                <Stack flexDirection="row" alignItems="center" gap={1} mb={1}>
                    <Typography color={grey[100]} fontSize={18}>Size:</Typography>
                    <Typography color={grey[400]} fontSize={14} component="span" mt={0.5}>{size}px</Typography>
                </Stack>
                <Slider min={14} max={100} value={size} onChange={({ target }) => {
                    setSize(target.value);
                    id && setTextSize(canvas.current, id, target.value);
                }} />
            </Box>
            <Box>
                <Stack flexDirection="row" alignItems="center" gap={1} mb={2}>
                    <Typography color={grey[100]} fontSize={18}>Color:</Typography>
                    <ColorPicker onChange={color => setColor(color)} />
                </Stack>
            </Box>
            <Button variant="contained" onClick={handleCreateText}>add new text</Button>
        </Stack>
    )
}

export default Text;