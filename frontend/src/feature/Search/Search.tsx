import {
    Box,
    Container,
    IconButton,
    InputBase,
    Stack,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import {grey} from "@mui/material/colors";
import PaintList from "../../components/PaintList/PaintList.tsx";
import SearchIcon from '@mui/icons-material/Search';
import {useSearchParams} from "react-router-dom";
import {useLayoutEffect, useState} from "react";
import OrderBy from "../../components/OrderBy/OrderBy.tsx";
import InputTags from "../../components/Form/InputTags/InputTags.tsx";

const Search = () => {
    const [searchParams] = useSearchParams();

    const [value, setValue] = useState<string>(searchParams.get('text') || '');
    const [orderBy, setOrderBy] = useState<string>('date');
    const [tags, setTags] = useState<string[]>([]);

    useLayoutEffect(() => {
        setValue(searchParams.get('text') || '');
    }, [searchParams.get('text')])


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
                            <InputTags tags={tags} onChange={setTags} />
                        </Stack>
                        <OrderBy value={orderBy} onChange={setOrderBy} />
                    </Stack>
                    <PaintList cardDetails tags={tags} order={orderBy} search={value} />
                </Box>
            </Stack>
        </Container>
    )
}

export default Search;