import {Canvas, PencilBrush, Shadow, SprayBrush} from "fabric";
import {IEvent} from "fabric/fabric-impl";
import {DRAW_TYPE} from "./draw.config.ts";
import {DEFAULT_COLOR, DEFAULT_SIZE} from "./Draw.tsx";

export const drawingMode = (paint: Canvas | null, mood: boolean) => {
    if(!paint) return;

    paint.isDrawingMode = mood;
    setActionType(paint, DRAW_TYPE.PENCIL);
    if( paint.freeDrawingBrush ) paint.freeDrawingBrush.width = DEFAULT_SIZE;
    if( paint.freeDrawingBrush ) paint.freeDrawingBrush.color = DEFAULT_COLOR;
}

export const setActionType = (paint: Canvas | null, type: DRAW_TYPE) => {
    if(!paint) return;

    const width = paint.freeDrawingBrush?.width || DEFAULT_SIZE;
    const color = paint.freeDrawingBrush?.color || DEFAULT_COLOR;

    if(type === DRAW_TYPE.PENCIL) {
        paint.freeDrawingBrush = new PencilBrush(paint);
        paint.freeDrawingBrush.width = width;
        paint.freeDrawingBrush.color = color;
        paint.freeDrawingBrush.shadow = undefined;
    }

    if(type === DRAW_TYPE.BRUSH) {
        paint.freeDrawingBrush = new PencilBrush(paint);
        paint.freeDrawingBrush.width = width;
        paint.freeDrawingBrush.color = color;
        paint.freeDrawingBrush.shadow = new Shadow({
            blur: parseInt('30', 10) || 0,
            offsetX: 0,
            offsetY: 0,
            affectStroke: true,
            color: paint.freeDrawingBrush.color,
        });
    }

    if(type === DRAW_TYPE.SPRAY) {
        paint.freeDrawingBrush = new SprayBrush(paint);
        paint.freeDrawingBrush.width = width;
        paint.freeDrawingBrush.color = color;
        paint.freeDrawingBrush.shadow = undefined;
    }
}

export const setBrushSize = (paint: Canvas | null, size: number) => {
    if(!paint) return;

    const d = paint.freeDrawingBrush;
    if(d) d.width = size;
    if(d.shadow) d.shadow.width = size;
}

export const setBrushColor = (paint: Canvas | null, color: string) => {
    if(!paint) return;

    const d = paint.freeDrawingBrush;
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