import {useQuery} from "@tanstack/react-query";
import * as userApi from "../../user.ts";

export const GET_USERS = 'getUsers';

const useGetUsers = (params: { username?: string, orderBy?: 'popular', limit?: number }) => {

    const { data, isPending } = useQuery({
        queryKey: [GET_USERS, params],
        queryFn: () =>
            userApi.getUsers(params),
        retry: false,
    });

    return {
        data,
        isPending
    }
}

export default useGetUsers;