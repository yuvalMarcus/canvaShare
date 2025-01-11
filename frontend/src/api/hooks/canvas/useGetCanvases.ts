import {useQuery} from "@tanstack/react-query";
import * as canvasApi from "../../canvas.ts";

const GET_CANVASES = 'getCanvases';

const useGetCanvases = () => {
    const { data, isPending } = useQuery({
        queryKey: [GET_CANVASES],
        queryFn: () => canvasApi.getCanvases({}),
    });

    return {
        data,
        isPending
    }
}

export default useGetCanvases;