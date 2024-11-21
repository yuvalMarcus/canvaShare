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
const Search = () => {
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
                                options={top100Films}
                                getOptionLabel={(option) => option.title}
                                defaultValue={[top100Films[13]]}
                                filterSelectedOptions
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
                                    value={'date'}
                                    onChange={() => {}}
                                >
                                    <MenuItem value={'date'}>Date</MenuItem>
                                    <MenuItem value={'likes'}>Like</MenuItem>
                                    <MenuItem value={'tags'}>Tags</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </Stack>
                    <CanvasList cardDetails />
                </Box>
            </Stack>
        </Container>
    )
}

export default Search;