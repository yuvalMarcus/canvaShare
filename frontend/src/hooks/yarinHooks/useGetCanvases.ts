import {useQuery} from "@tanstack/react-query";
import * as canvasApi from "../../api/painter.ts";

const GET_CANVASES = 'getCanvas';

const useGetCanvases = () => {
    const { data, isPending } = useQuery({
        queryKey: [GET_CANVASES],
        queryFn: () => canvasApi.getPainters({}),
    });

    return {
        data,
        isPending
    }
}

export default useGetCanvases;