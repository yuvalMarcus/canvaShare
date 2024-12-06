import { useAtom } from 'jotai'
import {selectedActionAtom} from "../state/painter.ts";

export const usePainter = () => {
    const [selectedAction, setSelectedAction] = useAtom(selectedActionAtom);

    return {
        selectedAction,
        setSelectedAction,
    }
}