import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import * as S from './Search.style.ts';
const Search = () => {
    return (
        <S.Container>
            <S.IconWrapper>
                <SearchIcon />
            </S.IconWrapper>
            <S.Input
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
            />
        </S.Container>
    )
}

export default Search;