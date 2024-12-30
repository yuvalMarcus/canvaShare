import {useQuery} from "@tanstack/react-query";
import * as api from "../tags.ts";

export const GET_TAGS = 'getTags';

const useGetTags = () => {

    const { data, isPending, isError } = useQuery({
        queryKey: [GET_TAGS],
        queryFn: () => api.getTags(),
    });

    return {
        data,
        isPending,
        isError
    }
}

export default useGetTags;