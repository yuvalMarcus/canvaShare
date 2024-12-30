import {Canvas, PencilBrush, Shadow, SprayBrush} from "fabric";
import {IEvent} from "fabric/fabric-impl";
import {DRAW_TYPE} from "./draw.config.ts";
import {DEFAULT_COLOR, DEFAULT_SIZE} from "./Draw.tsx";

export const drawingMode = (canvas: Canvas | null, mood: boolean) => {
    if(!canvas) return;

    canvas.isDrawingMode = mood;
    setActionType(canvas, DRAW_TYPE.PENCIL);
    if( canvas.freeDrawingBrush ) canvas.freeDrawingBrush.width = DEFAULT_SIZE;
    if( canvas.freeDrawingBrush ) canvas.freeDrawingBrush.color = DEFAULT_COLOR;
}

export const setActionType = (canvas: Canvas | null, type: DRAW_TYPE) => {
    if(!canvas) return;

    const width = canvas.freeDrawingBrush?.width || DEFAULT_SIZE;
    const color = canvas.freeDrawingBrush?.color || DEFAULT_COLOR;

    if(type === DRAW_TYPE.PENCIL) {
        canvas.freeDrawingBrush = new PencilBrush(canvas);
        canvas.freeDrawingBrush.width = width;
        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.shadow = undefined;
    }

    if(type === DRAW_TYPE.BRUSH) {
        canvas.freeDrawingBrush = new PencilBrush(canvas);
        canvas.freeDrawingBrush.width = width;
        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.shadow = new Shadow({
            blur: parseInt('30', 10) || 0,
            offsetX: 0,
            offsetY: 0,
            affectStroke: true,
            color: canvas.freeDrawingBrush.color,
        });
    }

    if(type === DRAW_TYPE.SPRAY) {
        canvas.freeDrawingBrush = new SprayBrush(canvas);
        canvas.freeDrawingBrush.width = width;
        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.shadow = undefined;
    }
}

export const setBrushSize = (canvas: Canvas | null, size: number) => {
    if(!canvas) return;

    const d = canvas.freeDrawingBrush;
    if(d) d.width = size;
    if(d.shadow) d.shadow.width = size;
}

export const setBrushColor = (canvas: Canvas | null, color: string) => {
    if(!canvas) return;

    const d = canvas.freeDrawingBrush;
    if(d) d.color = color;
    if(d.shadow) d.shadow.color = color;
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