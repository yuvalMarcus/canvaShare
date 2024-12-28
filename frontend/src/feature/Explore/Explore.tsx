import {Autocomplete, Box, Container, FormControl, MenuItem, Select, Stack, TextField} from "@mui/material";
import Typography from "@mui/material/Typography";
import CanvasList from "../../components/CanvasList/CanvasList.tsx";
import {grey} from "@mui/material/colors";
import ArtistsList from "../../components/ArtistsList/ArtistsList.tsx";
import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import * as tagApi from "../../api/tags.ts";

const Explore = () => {
    const [orderBy, setOrderBy] = useState<string>('date');
    const [tags, setTags] = useState<string[]>([]);

    const { data: tagsList, isPending: isPendingData } = useQuery({
        queryKey: [],
        queryFn: tagApi.getTags,
    });

    return (
        <Container>
            <Stack gap={4} py={2}>
                <Box>
                    <Typography variant="h4" color={grey[600]} textTransform="capitalize" mb={4}>
                        popular artists
                    </Typography>
                    <ArtistsList />
                </Box>
                <Box>
                    <Typography variant="h4" color={grey[600]} textTransform="capitalize" mb={4}>
                        popular arts
                    </Typography>
                    <Stack flexDirection="row" alignItems="center" gap={4} mb={4}>
                        <Stack flex={1}>
                            <Autocomplete
                                multiple
                                id="tags-outlined"
                                options={tagsList?.tags?.map(({ name }) => name) || []}
                                defaultValue={tags}
                                filterSelectedOptions
                                onChange={(_, tags) => setTags(tags)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Tags List"
                                        placeholder="Tags"
                                    />
                                )}
                            />
                        </Stack>
                        <Stack flexDirection="row" alignItems="center" gap={2}>
                            <Typography whiteSpace="nowrap" color={grey[700]} fontWeight="bold" fontSize={18} textTransform="capitalize">
                                Order By :
                            </Typography>
                            <FormControl variant="standard">
                                <Select
                                    value={orderBy}
                                    onChange={(event) => setOrderBy(event.target.value)}
                                >
                                    <MenuItem value={'date'}>Date</MenuItem>
                                    <MenuItem value={'likes'}>Like</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </Stack>
                    <CanvasList tags={tags.join(', ')} order={orderBy} cardDetails />
                </Box>
            </Stack>
        </Container>
    )
}

export default Explore;