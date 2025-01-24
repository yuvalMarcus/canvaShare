import {useQuery} from "@tanstack/react-query";
import * as api from "../../paint.ts";

export const GET_PAINT = 'getPaint';

const useGetPaint = (id?: number) => {

    const { data, isPending } = useQuery({
        queryKey: [GET_PAINT, id],
        queryFn: () => api.getPaint(id),
        enabled: !!id,
        retry: false,
    });

    return {
        data,
        isPending
    }
}

export default useGetPaint;