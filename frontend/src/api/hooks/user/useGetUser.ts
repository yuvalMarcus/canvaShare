import {useQuery} from "@tanstack/react-query";
import * as userApi from "../../user.ts";

export const GET_USER = 'getUser';

const useGetUser = (id?: string | number) => {

    const { data, isPending, isError } = useQuery({
        queryKey: [GET_USER, id],
        queryFn: () => userApi.getUser(id),
        enabled: !!id
    });

    return {
        data,
        isPending,
        isError
    }
}

export default useGetUser;