import { Canvas } from "fabric";
import * as fabric from "fabric";

const BOARD_PADDING = 20;
export const initCanvas = (width: number, height: number) => (
    new Canvas('canvas', {
        height: height - BOARD_PADDING,
        width: width - BOARD_PADDING,
        backgroundColor: '#fff',
        fireRightClick: true,  // <-- enable firing of right click events
        fireMiddleClick: true, // <-- enable firing of middle click events
        stopContextMenu: true, // <--  prevent context menu from showing
    })
);