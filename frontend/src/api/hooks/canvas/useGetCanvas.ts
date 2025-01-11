import {useQuery} from "@tanstack/react-query";
import * as api from "../../canvas.ts";

export const GET_CANVAS = 'getCanvas';

const useGetCanvas = (id?: number) => {

    const { data, isPending, isError } = useQuery({
        queryKey: [GET_CANVAS, id],
        queryFn: () => api.getCanvas(id),
        enabled: !!id
    });

    return {
        data,
        isPending,
        isError
    }
}

export default useGetCanvas;