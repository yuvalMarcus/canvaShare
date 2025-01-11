import {useQuery} from "@tanstack/react-query";
import * as userApi from '../../api/yarin.ts'

const GET_USERS = 'getUsers';

const useGetUsers = () => {
    const { data, isPending } = useQuery({
        queryKey: [GET_USERS],
        queryFn: () => userApi.getUsers(),
    });

    return {
        data,
        isPending
    }
}

export default useGetUsers;