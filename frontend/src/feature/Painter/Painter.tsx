import React, {useLayoutEffect, useRef} from "react";
import {Canvas} from "fabric";
import {Stack} from "@mui/material";
import Button from "@mui/material/Button";
import {grey} from "@mui/material/colors";
import BrushIcon from "@mui/icons-material/Brush";
import Typography from "@mui/material/Typography";
import ToolkitBox from "./Toolkit/ToolkitBox/ToolkitBox.tsx";
import ToolBar from "./Toolkit/ToolBar/ToolBar.tsx";

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
                <Stack gap={3} minWidth={30} p={1} sx={{ backgroundColor: grey[900]}}>
                    <Button sx={{ display: 'flex', flexDirection: 'column', gap: 1, textTransform: 'capitalize' }}>
                        <BrushIcon fontSize={'medium'} sx={{ color: grey[100] }} />
                        <Typography sx={{ color: grey[100] }}>brush</Typography>
                    </Button>
                </Stack>
                <Stack ref={controller} position="relative" flex={1} alignItems="center" justifyContent="center" height="calc(100vh - 50px)">
                    <ToolkitBox />
                    <canvas id="canvas" />
                </Stack>
            </Stack>
        </Stack>
    )
}

export default Painter;