import {createContext, useContext, useLayoutEffect, useState} from 'react';
import {CanvasPayload} from "../types/canvas.ts";
import {ACTION_TYPE} from "../feature/Painter/painter.config.ts";
import {useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import * as api from "../api/painter.ts";

const defaultCanvas: CanvasPayload = {
    name: "Untitled Canvas",
    description: '',
    tags: [],
    is_public: true,
    data: null,
    photo: '',
}

const PainterContext = createContext<{
    selectedAction: ACTION_TYPE | null,
    setSelectedAction: (value: (((prevState: (ACTION_TYPE | null)) => (ACTION_TYPE | null)) | ACTION_TYPE | null)) => void,
    canvas: CanvasPayload,
    handleUpload: any,
}>({
    selectedAction: null,
    setSelectedAction: () => {},
    canvas: defaultCanvas,
    handleUpload: () => {},
});

const PainterProvider = ({ children }) => {
    const [canvas, setCanvas] = useState<CanvasPayload>(defaultCanvas);
    const [selectedAction, setSelectedAction] = useState<ACTION_TYPE | null>(null);

    const { id: painterId } = useParams();

    const handleUpload = <T extends keyof CanvasPayload>(key: T, value: CanvasPayload[T]) => {
        setCanvas(prev => ({
            ...prev,
            [key]: value
        }))
    }

    useLayoutEffect(() => {
        (async () => {
            if(!painterId) return;

            const { data } = await api.getPainter(Number(painterId));


        })()
    }, []);

    return (
        <PainterContext.Provider value={{
            selectedAction,
            setSelectedAction,
            canvas,
            handleUpload
        }}>
            {children}
        </PainterContext.Provider>
    );
};

export const usePainter = () => useContext(PainterContext);

export default PainterProvider;