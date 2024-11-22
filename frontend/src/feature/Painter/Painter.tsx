import React, {useLayoutEffect, useRef} from "react";
import {Canvas} from "fabric";
import {Stack} from "@mui/material";
import Button from "@mui/material/Button";
import {grey} from "@mui/material/colors";
import BrushIcon from "@mui/icons-material/Brush";
import TextFormatIcon from '@mui/icons-material/TextFormat';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import Typography from "@mui/material/Typography";
import ToolkitBox from "./Toolkit/ToolkitBox/ToolkitBox.tsx";
import ToolBar from "./Toolkit/ToolBar/ToolBar.tsx";
import {drawingMode} from "./Toolkit/Brushes/brushes.utils.ts";

const BOARD_PADDING = 20;

const initCanvas = (width: number, height: number) => (
    new Canvas('canvas', {
        height: height - BOARD_PADDING,
        width: width - BOARD_PADDING,
        backgroundColor: '#fff',
    })
);
const Painter = () => {
    const controller = useRef<HTMLDivElement | null>(null);
    const canvas = useRef<Canvas | null>(null);

    useLayoutEffect(() => {
        if(!controller.current) return;

        const { width, height } = controller.current?.getBoundingClientRect();

        canvas.current = initCanvas(width, height);

        if(canvas.current) drawingMode(canvas.current, true);

        canvas.current?.renderAll();

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

    return (
        <Stack>
            <ToolBar />
            <Stack flexDirection="row">
                <Stack gap={2} minWidth={30} p={1} sx={{ backgroundColor: grey[900]}}>
                    <Button sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, textTransform: 'capitalize' }}>
                        <BrushIcon fontSize={'medium'} sx={{ color: grey[100] }} />
                        <Typography sx={{ color: grey[100] }}>draw</Typography>
                    </Button>
                    <Button sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, textTransform: 'capitalize' }}>
                        <TextFormatIcon fontSize={'large'} sx={{ color: grey[100] }} />
                        <Typography sx={{ color: grey[100] }}>Text</Typography>
                    </Button>
                    <Button sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, textTransform: 'capitalize' }}>
                        <CropSquareIcon fontSize={'large'} sx={{ color: grey[100] }} />
                        <Typography sx={{ color: grey[100] }}>Shape</Typography>
                    </Button>
                    <Button sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, textTransform: 'capitalize' }}>
                        <InsertPhotoIcon fontSize={'large'} sx={{ color: grey[100] }} />
                        <Typography sx={{ color: grey[100] }}>Photo</Typography>
                    </Button>
                </Stack>
                <Stack ref={controller} position="relative" flex={1} alignItems="center" justifyContent="center" height="calc(100vh - 50px)">
                    <ToolkitBox canvas={canvas} />
                    <canvas id="canvas" />
                </Stack>
            </Stack>
        </Stack>
    )
}

export default Painter;