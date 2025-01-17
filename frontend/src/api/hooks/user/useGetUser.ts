import {useQuery} from "@tanstack/react-query";
import * as api from "../../user.ts";

export const GET_USER = 'getUser';

const useGetUser = (id?: string | number) => {

    const { data, isPending, isRefetching } = useQuery({
        queryKey: [GET_USER, id],
        queryFn: () => api.getUser(id),
        enabled: !!id
    });

    return {
        data,
        isPending,
        isRefetching
    }
}

export default useGetUser;