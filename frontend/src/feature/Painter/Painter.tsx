import React, {useLayoutEffect, useRef, useState} from "react";
import {Canvas, FabricObject} from "fabric";
import {CircularProgress, Stack} from "@mui/material";
import ToolBar from "./components/ToolBar/ToolBar.tsx";
import ActionContent from "./components/ActionContent/ActionContent.tsx";
import {initCanvas} from "./painter.utils.ts";
import Menu from "./components/Menu/Menu.tsx";
import PainterProvider from "../../context/painter.context.tsx";
import * as api from "../../api/painter.ts";
import {useParams} from "react-router-dom";
import Typography from "@mui/material/Typography";
import {grey} from "@mui/material/colors";
import {handleDrawingPath} from "./components/ActionContent/Draw/draw.utils.ts";
import EditMenu from "./components/EditMenu/EditMenu.tsx";

export const TOOL_BAR_HEIGHT = 110;

FabricObject.ownDefaults.objectCaching = false;
FabricObject.customProperties = ['data'];

const Painter = () => {
    const controller = useRef<HTMLDivElement | null>(null);
    const canvas = useRef<Canvas | null>(null);
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
    const [painterLoading, setPainterLoading] = useState<boolean>(false);

    //const { selectedObjectId, setSelectedObjectId } = usePainter();

    const { id: painterId } = useParams();

    useLayoutEffect(() => {
        (async () => {
            if(!controller.current) return;

            const { width, height } = controller.current?.getBoundingClientRect();

            canvas.current = initCanvas(width, height);

            if(painterId) {
                setPainterLoading(true);
                const { data } = await api.getPainter(Number(painterId));

                canvas.current?.clear();

                await canvas.current?.loadFromJSON(data);

                setPainterLoading(false);
            }

            canvas.current?.on('path:created', handleDrawingPath);

            canvas.current?.on('selection:created', (event) => {
                console.log('event.selected[0', event.selected[0])
                setSelectedObjectId(event.selected[0].data.id);
            });

            canvas.current?.on('selection:updated', (event) => {
                setSelectedObjectId(event.selected[0].data.id);
            });

            canvas.current?.on('selection:cleared', (event) => {
                setSelectedObjectId(null);
            });

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

        })()

        return () => {
            canvas.current?.dispose();
            canvas.current = null;
        };
    }, []);


    return (
        <PainterProvider>
            <Stack>
                <ToolBar canvas={canvas} />
                <Stack flexDirection="row">
                    <Menu />
                    <Stack ref={controller} position="relative" flex={1} alignItems="center" justifyContent="center" height={`calc(100vh - ${TOOL_BAR_HEIGHT}px)`}>
                        {selectedObjectId && <EditMenu canvas={canvas} selectedId={selectedObjectId} />}
                        <ActionContent canvas={canvas} />
                        <canvas id="canvas" />
                    </Stack>
                </Stack>
            </Stack>
            {painterLoading && (
                <Stack alignItems="center" justifyContent="center" width="100%" height="100%" position="absolute" top={0} zIndex={10}  sx={{ backgroundColor: 'rgb(0 0 0 / 60%)' }}>
                    <Stack alignItems="center" gap={1} bgcolor={grey[100]} p={2} sx={{ opacity: 0.8 }}>
                        <Typography color={grey[900]} fontSize={18} textTransform="capitalize">
                            loading data
                        </Typography>
                        <CircularProgress />
                    </Stack>
                </Stack>
            )}
        </PainterProvider>
    )
}

export default Painter;