import {CircularProgress, Stack} from "@mui/material";
import Card from "./Artist/Artist.tsx";
import useGetUsers from "../../api/hooks/user/useGetUsers.ts";

const ArtistsList = () => {

    const { data: users, isPending } = useGetUsers({orderBy: 'popular', limit: 4});

    return (
        <Stack flexDirection="row" gap={2} justifyContent="center" flexWrap="wrap">
            {!isPending && (
             <>
                 {users?.map(({id, username, profilePhoto}) => <Card key={id} id={id} username={username} profilePhoto={profilePhoto} />)}
             </>
            )}
            {isPending && (
                <CircularProgress />
            )}
        </Stack>
    );
}

export default ArtistsList;