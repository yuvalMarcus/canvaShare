import {useQuery} from "@tanstack/react-query";
import * as userApi from "../../user.ts";

export const GET_USERS = 'getUsers';

const useGetUsers = (username?: string, orderBy?: '' | 'popular', limit?: number) => {

    const { data, isPending } = useQuery({
        queryKey: [GET_USERS, username, orderBy, limit],
        queryFn: () =>
            userApi.getUsers({ username: username, orderBy: orderBy, limit: limit }),
    });

    return {
        data,
        isPending
    }
}

export default useGetUsers;