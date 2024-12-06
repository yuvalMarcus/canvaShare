// https://fabricjs.com/demos/free-drawing/

import {Canvas, FabricObject, Path, PencilBrush} from "fabric";
import {useCallback} from "react";
import {IEvent} from "fabric/fabric-impl";

export const drawingMode = (canvas: Canvas | null, mood: boolean) => {
    if(!canvas) return;

    canvas.isDrawingMode = mood;
    canvas.freeDrawingBrush = mood ? new PencilBrush(canvas) : undefined;
}

export const setBrushSize = (canvas: Canvas | null, size: number) => {
    if(!canvas) return;

    const d = canvas.freeDrawingBrush;
    if(d) d.width = size;
}

export const setBrushColor = (canvas: Canvas | null, color: string) => {
    if(!canvas) return;

    const d = canvas.freeDrawingBrush;
    if(d) d.color = color;
}

export const handleDrawingPath = ({path}: IEvent<MouseEvent>) => {
    path.set('hasBorders', false);
    path.set('hasControls', false);
    path.set('hasRotatingPoint', false);
    path.set('lockMovementX', true);
    path.set('lockMovementY', true);
    path.set('selectable', false);
    path.set('hoverCursor', 'default');
};