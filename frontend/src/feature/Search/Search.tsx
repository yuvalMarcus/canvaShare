import {
    Autocomplete,
    Box,
    Container,
    FormControl,
    IconButton, InputBase,
    MenuItem,
    Select,
    Stack,
    TextField
} from "@mui/material";
import Typography from "@mui/material/Typography";
import {grey} from "@mui/material/colors";
import {top100Films} from "../../mook.ts";
import CanvasList from "../../components/CanvasList/CanvasList.tsx";
import SearchIcon from '@mui/icons-material/Search';
import {useSearchParams} from "react-router-dom";
import {useLayoutEffect, useState} from "react";
import useGetTags from "../../api/hooks/tag/useGetTags.ts";

const Search = () => {
    const [searchParams] = useSearchParams();

    const [value, setValue] = useState<string>(searchParams.get('text') || '');
    const [orderBy, setOrderBy] = useState<string>('date');
    const [tags, setTags] = useState<string[]>([]);

    useLayoutEffect(() => {
        setValue(searchParams.get('text') || '');
    }, [searchParams.get('text')])


    const { data: tagsList, isPending: isPendingData } = useGetTags();

    return (
        <Container>
            <Stack gap={4} py={2}>
                <Box>
                    <Typography variant="h4" color={grey[600]} textTransform="capitalize" mb={4}>
                        search
                    </Typography>
                    <Stack flexDirection="row" border={2} borderColor={grey[400]} mb={2} sx={{  backgroundColor: grey[100] }}>
                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder="Search Arts"
                            inputProps={{ 'aria-label': 'search' }}
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                        />
                        <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                    </Stack>
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
                    <CanvasList cardDetails tags={tags} order={orderBy} search={value} />
                </Box>
            </Stack>
        </Container>
    )
}

export default Search;