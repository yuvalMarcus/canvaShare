import {CircularProgress, Stack} from "@mui/material";
import Card from "./Artist/Artist.tsx";
import {artists} from "../../mook.ts";
import useGetUsers from "../../api/hooks/user/useGetUsers.ts";

const ArtistsList = () => {

    const { data: users, isPending } = useGetUsers();

    console.log('users', users)

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