// https://fabricjs.com/demos/free-drawing/

import {Canvas, Textbox} from "fabric";

export const updateFontWeight = (canvas: Canvas, id: string, fontWeight: string) => {
    const currentText = canvas.getObjects().find((obj) => obj.id === id);
    if(!currentText) return;

    currentText.set("fontWeight", fontWeight);
    canvas?.renderAll();
}

export const updateTextDecoration = (canvas: Canvas, id: string, isUnderline: boolean) => {
    const currentText = canvas.getObjects().find((obj) => obj.id === id);
    if(!currentText) return;

    currentText.set("underline", isUnderline);
    canvas?.renderAll();
}

export const setTextSize = (canvas: Canvas, id: string, size: number) => {
    const currentText = canvas.getObjects().find((obj) => obj.id === id);
    if(!currentText) return;

    const draft = new Textbox(currentText.get('text'), { fontSize: size });
    currentText.set('fontSize', size);
    currentText.set('width', draft.width);
    canvas?.renderAll();
}

export const setTextColor = (canvas: Canvas, id: string, color: string) => {
    const currentText = canvas.getObjects().find((obj) => obj.id === id);
    if(!currentText) return;
    currentText.set('fill', color);
    canvas?.renderAll();
}