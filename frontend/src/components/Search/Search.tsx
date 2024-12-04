import React, {useState} from "react";
import SearchIcon from "@mui/icons-material/Search";
import {useNavigate} from "react-router-dom";
import {
    FormControlLabel,
    IconButton,
    InputBase,
    Radio,
    RadioGroup,
    Stack
} from "@mui/material";
import {grey} from "@mui/material/colors";

const Search = () => {
    const [type, setType] = useState<string>("arts");

    const navigate = useNavigate();

    const handleClickKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const key = event.key;
        if(key === 'Enter') {
            navigate('/search');
        }
    }

    return (
        <Stack flexDirection="row" alignItems="center" flex={1} border={2} borderColor={grey[900]} sx={{  backgroundColor: grey[800] }} onKeyDown={handleClickKey}>
            <InputBase
                sx={{ ml: 1, flex: 1, color: grey[100] }}
                placeholder="Search Arts"
                inputProps={{ 'aria-label': 'search' }}
            />
            <IconButton type="button" aria-label="search" onClick={() => navigate('/search')}>
                <SearchIcon sx={{ color: grey[100] }} />
            </IconButton>
        </Stack>
    )
}

export default Search;