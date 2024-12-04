// https://fabricjs.com/demos/free-drawing/

import {Circle, Polygon, Rect, Triangle, Control} from "fabric";

function deleteObject(_eventData, transform) {
    const canvas = transform.target.canvas;
    canvas.remove(transform.target);
    canvas.requestRenderAll();
}

function renderIcon(ctx, left, top, _styleOverride, fabricObject) {
    return '<div>sdsdsd</div>';
}

export const getSquare = (id: string, fill: string, stroke: string, strokeWidth: number) => {
    const square = new Rect({
        id,
        category: 'shape',
        width: 200,
        height: 200,
        fill,
        stroke,
        strokeWidth
    });
    square.controls.deleteControl = new Control({
        x: 0.5,
        y: -0.5,
        offsetY: 16,
        cursorStyle: 'pointer',
        mouseUpHandler: deleteObject,
        render: renderIcon,
        cornerSize: 24,
    });
    return square;
}

export const getCircle = (id: string, fill: string, stroke: string, strokeWidth: number) => {
    const circle = new Circle({
        id,
        category: 'shape',
        radius: 50,
        fill,
        stroke,
        strokeWidth
    });
    return circle;
}

export const getRectangle = (id: string, fill: string, stroke: string, strokeWidth: number) => {
    const rectangle = new Rect({
        id,
        category: 'shape',
        width: 400,
        height: 200,
        fill,
        stroke,
        strokeWidth
    });
    return rectangle;
}

export const getTriangular = (id: string, fill: string, stroke: string, strokeWidth: number) => {
    const triangular = new Triangle({
        id, category: 'shape', width: 200, height: 250, fill, stroke, strokeWidth: strokeWidth,
        strokeUniform: true
    });
    return triangular;
}