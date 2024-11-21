import {useAtom} from "jotai";
import {brushAtom, colorAtom, sizeAtom} from "../../state/painter/brush.ts";

const useBrush = () => {
    const [brush, setBrush] = useAtom(brushAtom);
    const [size, setSize] = useAtom(sizeAtom);
    const [color, setColor] = useAtom(colorAtom);

    return {
        brush,
        size,
        color,
        setBrush,
        setSize,
        setColor
    }
}

export default useBrush;