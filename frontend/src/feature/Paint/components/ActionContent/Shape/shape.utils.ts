import {Circle, Rect, Triangle} from "fabric";

export const getSquare = (id: string, fill: string, stroke: string, strokeWidth: number) => {
    const square = new Rect({
        width: 200,
        height: 200,
        fill,
        stroke,
        strokeWidth,
        data: {
            id,
            category: 'shape',
        }
    });
    return square;
}

export const getCircle = (id: string, fill: string, stroke: string, strokeWidth: number) => {
    const circle = new Circle({
        radius: 50,
        fill,
        stroke,
        strokeWidth,
        data: {
            id,
            category: 'shape',
        }
    });
    return circle;
}

export const getRectangle = (id: string, fill: string, stroke: string, strokeWidth: number) => {
    const rectangle = new Rect({
        width: 400,
        height: 200,
        fill,
        stroke,
        strokeWidth,
        data: {
            id,
            category: 'shape',
        }
    });
    return rectangle;
}

export const getTriangular = (id: string, fill: string, stroke: string, strokeWidth: number) => {
    const triangular = new Triangle({
        width: 200, height: 250, fill, stroke, strokeWidth: strokeWidth,
        strokeUniform: true,
        data: {
            id,
            category: 'shape',
        }
    });
    return triangular;
}