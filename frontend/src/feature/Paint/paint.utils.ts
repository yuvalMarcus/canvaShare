import { Canvas } from "fabric";

const BOARD_PADDING = 20;

export const initPaint = (width: number, height: number) => (
    new Canvas('paint', {
        height: height - BOARD_PADDING,
        width: width - BOARD_PADDING,
        backgroundColor: '#fff',
        fireRightClick: true,  // <-- enable firing of right click events
        fireMiddleClick: true, // <-- enable firing of middle click events
        stopContextMenu: true, // <--  prevent context menu from showing
    })
);