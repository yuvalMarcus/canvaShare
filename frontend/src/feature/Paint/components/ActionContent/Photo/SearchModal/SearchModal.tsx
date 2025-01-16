import {CircularProgress, ImageList, ImageListItem, Modal, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {blue, grey} from "@mui/material/colors";
import {FC, MutableRefObject, useState} from "react";
import {Canvas, Image} from "fabric";
import {useQuery} from "@tanstack/react-query";
import * as api from '../../../../../../api/paint.ts';
import Button from "@mui/material/Button";
import Search from "../../../../../../components/Search/Search.tsx";

interface SearchPhotosProps {
    canvas: MutableRefObject<Canvas | null>;
    isOpen: boolean;
    onClose: () => void;
}

const SearchModal: FC<SearchPhotosProps> = ({ canvas, isOpen, onClose }) => {
    const [search, setSearch] = useState<string>('');
    const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
    //const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

    const { data, isPending } = useQuery({
        queryKey: [search],
        queryFn: () => search && api.searchPhotos({ category: search }),
    })

    const click = async () => {
        const selectedPhoto = data?.results?.find(({ id }) => id === selectedPhotoId);

        if(!selectedPhoto) return;

        const img = await Image.fromURL(selectedPhoto.urls.regular, { crossOrigin: 'anonymous' });

        img.scaleToWidth(400);

        canvas.current?.add(img);
        canvas.current?.centerObject(img);
        canvas.current?.renderAll();

        onClose();
    }

    const hasResults = !!data?.results?.length;

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            //aria-labelledby={name}
            //aria-describedby={description}
        >
            <Stack gap={1} position="absolute" top="50%" left="50%" minWidth={600} p={1} bgcolor={grey[200]} border={2} borderColor={grey[900]} boxShadow={24} sx={{
                transform: 'translate(-50%, -50%)',
            }}>
                <Typography color={grey[900]} fontSize={18} textTransform="capitalize">search photos:</Typography>
                <Search onClick={setSearch} placeholder='Name of the subject of the photos' />
                {!isPending && hasResults && (
                    <ImageList variant="quilted" sx={{ maxHeight: 450, padding: 1 }} cols={3} rowHeight={164}>
                        {data?.results?.map((item) => (
                            <ImageListItem key={item.img} sx={{ border: selectedPhotoId === item.id ? `5px solid ${blue[300]}` : 'none', boxSizing: 'border-box' }}>
                                <img
                                    onClick={() => setSelectedPhotoId(item.id)}
                                    srcSet={item.urls.thumb}
                                    src={item.urls.thumb}
                                    alt={item.alt_description}
                                    loading="lazy"
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                )}
                {!isPending && !hasResults && (
                    <Typography color={grey[900]} textTransform="capitalize" textAlign="center" py={1}>no results</Typography>
                )}
                {isPending && (
                    <Stack alignItems="center" justifyContent="center" py={1}>
                        <CircularProgress size={24} />
                    </Stack>
                )}
                <Button variant="contained" disabled={isPending || !selectedPhotoId} onClick={click}>add new photo</Button>
            </Stack>
        </Modal>
    )
}

export default SearchModal;