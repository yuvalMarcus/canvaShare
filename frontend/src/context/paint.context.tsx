import {createContext, useContext, useLayoutEffect, useState} from 'react';
import {PaintPayload} from "../types/paint.ts";
import {ACTION_TYPE} from "../feature/Paint/paint.config.ts";
import {useParams} from "react-router-dom";
import * as api from "../api/paint.ts";

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

    const { id: paintId } = useParams();

    const handleUpload = <T extends keyof PaintPayload>(key: T, value: PaintPayload[T]) => {
        setPayload(prev => ({
            ...prev,
            [key]: value
        }))
    }

    useLayoutEffect(() => {
        (async () => {
            if(!paintId) return;

            const { data } = await api.getPaint(Number(paintId));


        })()
    }, []);

    return (
        <PaintContext.Provider value={{
            selectedAction,
            setSelectedAction,
            selectedObjectId,
            setSelectedObjectId,
            payload,
            handleUpload
        }}>
            {children}
        </PaintContext.Provider>
    );
};

export const usePaint = () => useContext(PaintContext);

export default PaintProvider;