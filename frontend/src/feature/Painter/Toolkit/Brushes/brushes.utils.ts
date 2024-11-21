// https://fabricjs.com/demos/free-drawing/

import {Canvas, PencilBrush} from "fabric";

export const drawingMode = (canvas: Canvas, mood: boolean) => {
    canvas.isDrawingMode = mood;
    canvas.freeDrawingBrush = new PencilBrush(canvas);
}

export const setBrushSize = (canvas: Canvas, size: number) => {
    const d = canvas.freeDrawingBrush;
    if(d) d.width = size;
}

export const setBrushColor = (canvas: Canvas, color: string) => {
    const d = canvas.freeDrawingBrush;
    if(d) d.color = color;
}