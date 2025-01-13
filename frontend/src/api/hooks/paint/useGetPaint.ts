import {useQuery} from "@tanstack/react-query";
import * as api from "../../paint.ts";

export const GET_PAINT = 'getPaint';

const useGetPaint = (id?: number) => {

    const { data, isPending, isError } = useQuery({
        queryKey: [GET_PAINT, id],
        queryFn: () => api.getPaint(id),
        enabled: !!id
    });

    return {
        data,
        isPending,
        isError
    }
}

export default useGetPaint;