// https://fabricjs.com/demos/free-drawing/

import {Canvas, Textbox} from "fabric";

export const updateFontWeight = (paint: Canvas, id: string, fontWeight: string) => {
    const currentText = paint.getObjects().find((obj) => obj.id === id);
    if(!currentText) return;

    currentText.set("fontWeight", fontWeight);
    paint?.renderAll();
}

export const updateTextDecoration = (paint: Canvas, id: string, isUnderline: boolean) => {
    const currentText = paint.getObjects().find((obj) => obj.id === id);
    if(!currentText) return;

    currentText.set("underline", isUnderline);
    paint?.renderAll();
}

export const setTextSize = (paint: Canvas, id: string, size: number) => {
    const currentText = paint.getObjects().find((obj) => obj.id === id);
    if(!currentText) return;

    const draft = new Textbox(currentText.get('text'), { fontSize: size });
    currentText.set('fontSize', size);
    currentText.set('width', draft.width);
    paint?.renderAll();
}

export const setTextColor = (paint: Canvas, id: string, color: string) => {
    const currentText = paint.getObjects().find((obj) => obj.id === id);
    if(!currentText) return;
    currentText.set('fill', color);
    paint?.renderAll();
}