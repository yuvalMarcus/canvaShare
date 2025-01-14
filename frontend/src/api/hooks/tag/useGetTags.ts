import {useQuery} from "@tanstack/react-query";
import * as api from "../../tags.ts";

export const GET_TAGS = 'getTags';

const useGetTags = () => {

    const { data, isPending } = useQuery({
        queryKey: [GET_TAGS],
        queryFn: () => api.getTags(),
    });

    return {
        data,
        isPending
    }
}

export default useGetTags;