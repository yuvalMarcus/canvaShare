import {createContext, useContext, useState} from 'react';
import {PaintPayload} from "../types/paint.ts";
import {ACTION_TYPE} from "../feature/Paint/paint.config.ts";

type PaintPayloadType = <T extends keyof PaintPayload>(key: T, value: PaintPayload[T]) => void;

const defaultPaint: PaintPayload = {
    name: null,
    description: null,
    tags: null,
    isPublic: true,
    data: null,
    photo: '',
}

const PaintContext = createContext<{
    selectedAction: ACTION_TYPE | null,
    setSelectedAction: (value: (((prevState: (ACTION_TYPE | null)) => (ACTION_TYPE | null)) | ACTION_TYPE | null)) => void,
    selectedObjectId: string | null,
    setSelectedObjectId: (value: (((prevState: (string | null)) => (string | null)) | string | null)) => void,
    payload: PaintPayload,
    handleUpload: PaintPayloadType,
}>({
    selectedAction: null,
    setSelectedAction: () => {},
    selectedObjectId: null,
    setSelectedObjectId: () => {},
    payload: defaultPaint,
    handleUpload: () => {},
});

const PaintProvider = ({ children }) => {
    const [payload, setPayload] = useState<PaintPayload>(defaultPaint);
    const [selectedAction, setSelectedAction] = useState<ACTION_TYPE | null>(null);
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

    const handleUpload = <T extends keyof PaintPayload>(key: T, value: PaintPayload[T]) => {
        setPayload(prev => ({
            ...prev,
            [key]: value
        }))
    }

    return (
        <PaintContext.Provider value={{
            selectedAction,
            setSelectedAction,
            selectedObjectId,
            setSelectedObjectId,
            payload,
            handleUpload,
        }}>
            {children}
        </PaintContext.Provider>
    );
};

export const usePaint = () => useContext(PaintContext);

export default PaintProvider;