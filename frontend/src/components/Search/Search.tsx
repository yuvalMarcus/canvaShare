import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import {useNavigate} from "react-router-dom";
import {FormControl, MenuItem, Select} from "@mui/material";
import {grey} from "@mui/material/colors";
import * as S from './Search.style.ts';

const Search = () => {

    const navigate = useNavigate();

    const handleClickKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const key = event.key;
        if(key === 'Enter') {
            navigate('/search');
        }
    }

    return (
        <>
            <S.Container onKeyDown={handleClickKey}>
                <S.IconWrapper>
                    <SearchIcon />
                </S.IconWrapper>
                <S.Input
                    placeholder="Search…"
                    inputProps={{ 'aria-label': 'search' }}
                />
            </S.Container>
            <FormControl variant="standard">
                <Select
                    value={'arts'}
                    onChange={() => {}}
                    sx={{
                        color: grey[100],
                        '.MuiSelect-icon': {
                            color: grey[100]
                        }
                    }}
                >
                    <MenuItem value={'arts'}>Arts</MenuItem>
                    <MenuItem value={'artists'}>Artists</MenuItem>
                </Select>
            </FormControl>
        </>
    )
}

export default Search;