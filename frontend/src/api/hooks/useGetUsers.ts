import {useQuery} from "@tanstack/react-query";
import * as userApi from "../user.ts";
import {getUsers} from "../user.ts";

export const GET_USERS = 'getUsers';

const useGetUsers = () => {

    const { data, isPending, isError } = useQuery({
        queryKey: [GET_USERS],
        queryFn: () => userApi.getUsers(),
    });

    return {
        data,
        isPending,
        isError
    }
}

export default useGetUsers;