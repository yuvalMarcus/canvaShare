import {createContext, useContext, useLayoutEffect, useState} from 'react';
import {CanvasPayload} from "../types/canvas.ts";
import {ACTION_TYPE} from "../feature/Canvas/canvas.config.ts";
import {useParams} from "react-router-dom";
import * as api from "../api/canvas.ts";

const defaultCanvas: CanvasPayload = {
    name: "",
    description: "",
    tags: null,
    isPublic: true,
    data: null,
    photo: '',
}

const CanvasContext = createContext<{
    selectedAction: ACTION_TYPE | null,
    setSelectedAction: (value: (((prevState: (ACTION_TYPE | null)) => (ACTION_TYPE | null)) | ACTION_TYPE | null)) => void,
    selectedObjectId: string | null,
    setSelectedObjectId: (value: (((prevState: (string | null)) => (string | null)) | string | null)) => void,
    payload: CanvasPayload,
    handleUpload: any,
}>({
    selectedAction: null,
    setSelectedAction: () => {},
    selectedObjectId: null,
    setSelectedObjectId: () => {},
    payload: defaultCanvas,
    handleUpload: () => {},
});

const CanvasProvider = ({ children }) => {
    const [payload, setPayload] = useState<CanvasPayload>(defaultCanvas);
    const [selectedAction, setSelectedAction] = useState<ACTION_TYPE | null>(null);
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

    console.log('payload', payload)

    const { id: canvasId } = useParams();

    const handleUpload = <T extends keyof CanvasPayload>(key: T, value: CanvasPayload[T]) => {
        setPayload(prev => ({
            ...prev,
            [key]: value
        }))
    }

    useLayoutEffect(() => {
        (async () => {
            if(!canvasId) return;

            const { data } = await api.getCanvas(Number(canvasId));


        })()
    }, []);

    return (
        <CanvasContext.Provider value={{
            selectedAction,
            setSelectedAction,
            selectedObjectId,
            setSelectedObjectId,
            payload,
            handleUpload
        }}>
            {children}
        </CanvasContext.Provider>
    );
};

export const useCanvas = () => useContext(CanvasContext);

export default CanvasProvider;