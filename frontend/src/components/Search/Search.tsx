import React, {FC, useState} from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
    IconButton,
    InputBase,
    Stack
} from "@mui/material";
import {grey} from "@mui/material/colors";

interface SearchProps {
    theme?: 'light' | 'dark';
    placeholder: string;
    dValue?: string;
    onClick?: (value: string) => void;
}

const Search: FC<SearchProps> = ({ theme = 'light', placeholder, dValue, onClick }) => {
    const [value, setValue] = useState<string>(dValue || '');

    const handleClickKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const key = event.key;
        if(key === 'Enter') {
            onClick?.(value);
        }
    }

    const isDark = theme === 'dark';

    return (
        <Stack
            flexDirection="row"
            alignItems="center"
            flex={1}
            border={2}
            borderColor={isDark ? grey[900] : undefined}
            bgcolor={isDark ? grey[800] : grey[300]}
            onKeyDown={handleClickKey}>
            <InputBase
                sx={{ ml: 1, flex: 1, color: isDark ? grey[100] : undefined }}
                placeholder={placeholder}
                inputProps={{ 'aria-label': 'search' }}
                value={value}
                onChange={({ target }) => setValue(target.value)}
            />
            <IconButton type="button" aria-label="search" disabled={false} onClick={() => onClick?.(value)}>
                <SearchIcon sx={{ color: isDark ? grey[100] : grey[800] }} />
            </IconButton>
        </Stack>
    )
}

export default Search;