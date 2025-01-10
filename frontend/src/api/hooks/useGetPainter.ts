import {useQuery} from "@tanstack/react-query";
import * as api from "../painter.ts";

export const GET_PAINTER = 'getPainter';

const useGetPainter = (id?: number) => {

    const { data, isPending, isError } = useQuery({
        queryKey: [GET_PAINTER, id],
        queryFn: () => api.getPainter(id),
        enabled: !!id
    });

    return {
        data,
        isPending,
        isError
    }
}

export default useGetPainter;