import {createContext, useContext, useState} from 'react';
import {CanvasPayload} from "../types/canvas.ts";

const defaultCanvas: CanvasPayload = {
    name: "Untitled Canvas",
    //description: null,
    tags: ['animal'],
    isPublic: true,
    data: null,
    //photo: null,
}

const CanvasContext = createContext<{
    canvas: CanvasPayload,
    handleUpload: any,
}>({
    canvas: defaultCanvas,
    handleUpload: () => {},
});

const CanvasProvider = ({ children }) => {
    const [canvas, setCanvas] = useState<CanvasPayload>(defaultCanvas);

    const handleUpload = <T extends keyof CanvasPayload>(key: T, value: CanvasPayload[T]) => {
        setCanvas(prev => ({
            ...prev,
            [key]: value
        }))
    }

    return (
        <CanvasContext.Provider value={{ canvas, handleUpload }}>
            {children}
        </CanvasContext.Provider>
    );
};

export const useCanvas = () => useContext(CanvasContext);

export default CanvasProvider;