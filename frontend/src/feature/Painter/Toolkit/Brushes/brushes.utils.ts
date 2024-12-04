// https://fabricjs.com/demos/free-drawing/

import {Canvas, FabricObject, Path, PencilBrush} from "fabric";
import {useCallback} from "react";

export const drawingMode = (canvas: Canvas, mood: boolean) => {
    canvas.isDrawingMode = mood;
    canvas.freeDrawingBrush = mood ? new PencilBrush(canvas) : undefined;
}

export const setBrushSize = (canvas: Canvas, size: number) => {
    const d = canvas.freeDrawingBrush;
    if(d) d.width = size;
}

export const setBrushColor = (canvas: Canvas, color: string) => {
    const d = canvas.freeDrawingBrush;
    if(d) d.color = color;
}

export const handleDrawingPath = ({path}: {path:Path}): void => {
    path.set('hasBorders', false);
    path.set('hasControls', false);
    path.set('hasRotatingPoint', false);
    path.set('lockMovementX', true);
    path.set('lockMovementY', true);
    path.set('selectable', false);
    path.set('hoverCursor', 'default');
};