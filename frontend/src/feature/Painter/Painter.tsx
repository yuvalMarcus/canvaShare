import React, {useLayoutEffect, useRef, useState} from "react";
import {Canvas} from "fabric";
import {Box, Stack} from "@mui/material";
import Button from "@mui/material/Button";
import {blue, grey} from "@mui/material/colors";
import BrushIcon from "@mui/icons-material/Brush";
import TextFormatIcon from '@mui/icons-material/TextFormat';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import Typography from "@mui/material/Typography";
import ToolkitBox from "./Toolkit/ToolkitBox/ToolkitBox.tsx";
import ToolBar from "./Toolkit/ToolBar/ToolBar.tsx";
import {drawingMode, handleDrawingPath} from "./Toolkit/Brushes/brushes.utils.ts";
import OptionsBox from "./Toolkit/OptionsBox/OptionsBox.tsx";
import CanvasMenu from "./CanvasMenu/CanvasMenu.tsx";

const BOARD_PADDING = 20;

const initCanvas = (width: number, height: number) => (
    new Canvas('canvas', {
        height: height - BOARD_PADDING,
        width: width - BOARD_PADDING,
        backgroundColor: '#fff',
        fireRightClick: true,  // <-- enable firing of right click events
        fireMiddleClick: true, // <-- enable firing of middle click events
        stopContextMenu: true, // <--  prevent context menu from showing
    })
);
const Painter = () => {
    const [actionType, setActionType] = useState<"draw" | "text" | "shape" | "photo" | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [position, setPosition] = useState<{ x: 0, y: 0 } | null>(null);
    const controller = useRef<HTMLDivElement | null>(null);
    const canvas = useRef<Canvas | null>(null);

    useLayoutEffect(() => {
        if(!controller.current) return;

        const { width, height } = controller.current?.getBoundingClientRect();

        canvas.current = initCanvas(width, height);

        canvas.current?.on('path:created', handleDrawingPath);
        canvas.current?.on('selection:created', (event) => {
            console.log('event', event)
            setSelectedId(event.selected[0].id);
        });
        canvas.current?.on('contextmenu', (event) => {
            //event.preventDefault();

            console.log(event)
            console.log(event.e.offsetX)
            console.log(event.e.offsetY)
            setPosition({
                x: event.e.offsetX,
                y: event.e.offsetY
            })
        });

        canvas.current?.renderAll();

        window.addEventListener("contextmenu", (event) => {
            console.log(event)
        });

/*
        canvas.current?.on('mouse:wheel', function(opt) {
            var delta = opt.e.deltaY;
            var zoom = canvas.current?.getZoom() || 1;
            zoom *= 0.999 ** delta;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.01) zoom = 0.01;
            canvas.current?.setZoom(zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });
 */

        return () => {
            canvas.current?.dispose();
            canvas.current = null;
        };
    }, [controller.current]);

    const oncontextmenu = (event) => {
        event.preventDefault();
        console.log(event)
    };

    return (
        <Stack>
            <ToolBar />
            <Stack flexDirection="row">
                <Stack gap={2} minWidth={30} p={1} sx={{ backgroundColor: grey[900]}}>
                    <Button sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, textTransform: 'capitalize' }} onClick={() => setActionType("draw" )}>
                        <BrushIcon fontSize={'medium'} sx={{ color: actionType === "draw" ? blue[300] : grey[100] }} />
                        <Typography sx={{ color: actionType === "draw" ? blue[300] : grey[100] }}>draw</Typography>
                    </Button>
                    <Button sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, textTransform: 'capitalize' }} onClick={() => setActionType("text" )}>
                        <TextFormatIcon fontSize={'large'} sx={{ color: actionType === "text" ? blue[300] : grey[100] }} />
                        <Typography sx={{ color: actionType === "text" ? blue[300] : grey[100] }}>Text</Typography>
                    </Button>
                    <Button sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, textTransform: 'capitalize' }} onClick={() => setActionType("shape" )}>
                        <CropSquareIcon fontSize={'large'} sx={{ color: actionType === "shape" ? blue[300] : grey[100] }} />
                        <Typography sx={{ color: actionType === "shape" ? blue[300] : grey[100] }}>Shape</Typography>
                    </Button>
                    <Button sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, textTransform: 'capitalize' }} onClick={() => setActionType("photo" )}>
                        <InsertPhotoIcon fontSize={'large'} sx={{ color: actionType === "photo" ? blue[300] : grey[100] }} />
                        <Typography sx={{ color: actionType === "photo" ? blue[300] : grey[100] }}>Photo</Typography>
                    </Button>
                </Stack>
                <Stack ref={controller} position="relative" flex={1} alignItems="center" justifyContent="center" height="calc(100vh - 50px)">
                    {/* <ToolkitBox canvas={canvas} actionType={actionType} onClose={() => setActionType(null)} />*/}
                    <OptionsBox canvas={canvas} actionType={actionType} onClose={() => setActionType(null)} />
                    {/* <CanvasMenu canvas={canvas} position={position} selectedId={selectedId} actionType={actionType} onClose={() => {}} /> */}
                    <canvas id="canvas" onContextMenu={oncontextmenu} />
                </Stack>
            </Stack>
        </Stack>
    )
}

export default Painter;