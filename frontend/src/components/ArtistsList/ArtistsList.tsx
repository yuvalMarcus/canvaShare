import {Stack} from "@mui/material";
import Card from "./Artist/Artist.tsx";
import {artists} from "../../mook.ts";

const ArtistsList = () => {
    return (
        <Stack flexDirection="row" gap={2} justifyContent="center" flexWrap="wrap">
            {artists.map(({id, name, photo}) => <Card key={id} name={name} photo={photo} />)}
        </Stack>
    );
}

export default ArtistsList;