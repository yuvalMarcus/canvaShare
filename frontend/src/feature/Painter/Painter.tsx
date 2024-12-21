import React, {useLayoutEffect, useRef} from "react";
import {Canvas, FabricObject} from "fabric";
import {Box, CircularProgress, Stack} from "@mui/material";
import ToolBar from "./Toolkit/ToolBar/ToolBar.tsx";
import {handleDrawingPath} from "./Toolkit/Draw/draw.utils.ts";
import ActionContent from "./Components/ActionContent/ActionContent.tsx";
import {initCanvas} from "./painter.utils.ts";
import Menu from "./Components/Menu/Menu.tsx";
import PainterProvider from "../../context/painter.context.tsx";
import * as api from "../../api/painter.ts";
import {useParams} from "react-router-dom";
import Typography from "@mui/material/Typography";
import {grey} from "@mui/material/colors";

export const TOOL_BAR_HEIGHT = 110;

FabricObject.ownDefaults.objectCaching = false;


const Painter = () => {
    //const [selectedId, setSelectedId] = useState<string | null>(null);
    //const [position, setPosition] = useState<{ x: 0, y: 0 } | null>(null);
    const controller = useRef<HTMLDivElement | null>(null);
    const canvas = useRef<Canvas | null>(null);

    const { id: painterId } = useParams();

    useLayoutEffect(() => {
        (async () => {
            if(!controller.current) return;

            const { width, height } = controller.current?.getBoundingClientRect();

            canvas.current = initCanvas(width, height);

            if(painterId) {
                //const { data } = await api.getPainter(Number(painterId));
            }

            canvas.current?.on('path:created', handleDrawingPath);

            /*
            canvas.current?.on('selection:created', (event) => {
                console.log('event', event)
                setSelectedId(event.selected[0].id);
            });
            */
            /*
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
             */

            canvas.current?.renderAll();

            /*
            window.addEventListener("contextmenu", (event) => {
                console.log(event)
            });
             */

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

        })()
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
        <PainterProvider>
            <Stack>
                <ToolBar canvas={canvas} />
                <Stack flexDirection="row">
                    <Menu />
                    <Stack ref={controller} position="relative" flex={1} alignItems="center" justifyContent="center" height={`calc(100vh - ${TOOL_BAR_HEIGHT}px)`}>
                        {/* <ToolkitBox canvas={canvas} actionType={actionType} onClose={() => setActionType(null)} />*/}
                        <ActionContent canvas={canvas} />
                        {/* <CanvasMenu canvas={canvas} position={position} selectedId={selectedId} actionType={actionType} onClose={() => {}} /> */}
                        <canvas id="canvas" onContextMenu={oncontextmenu} />
                    </Stack>
                </Stack>
                {painterId && <Stack alignItems="center" justifyContent="center" width="100%" height="100%" position="absolute" zIndex={10}  sx={{ backgroundColor: 'rgb(0 0 0 / 60%)' }}>
                    <Stack alignItems="center" gap={1} bgcolor={grey[100]} p={2} sx={{ opacity: 0.8 }}>
                        <Typography color={grey[900]} fontSize={18} textTransform="capitalize">
                            loading data
                        </Typography>
                        <CircularProgress />
                    </Stack>
                </Stack>}
            </Stack>
        </PainterProvider>
    )
}

export default Painter;