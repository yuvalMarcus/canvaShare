import {CircularProgress, Stack} from "@mui/material";
import Card from "./Artist/Artist.tsx";
import useGetUsers from "../../api/hooks/user/useGetUsers.ts";

const ArtistsList = () => {

    const { data: users, isPending } = useGetUsers({ orderBy: 'popular', limit: 4 });

    return (
        <Stack flexDirection="row" gap={2} justifyContent="center" flexWrap="wrap">
            {!isPending && (
             <>
                 {users?.map((user) => <Card key={user.id} {...user} />)}
             </>
            )}
            {isPending && (
                <CircularProgress />
            )}
        </Stack>
    );
}

export default ArtistsList;