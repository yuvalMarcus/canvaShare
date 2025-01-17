import {useQuery} from "@tanstack/react-query";
import * as paintApi from "../../paint.ts";

export const GET_PAINTS = 'getPaints';

const useGetPaints = () => {

    const { data, isPending } = useQuery({
        queryKey: [GET_PAINTS],
        queryFn: () => paintApi.getPaints({}),
    });

    return {
        data,
        isPending
    }
}

export default useGetPaints;