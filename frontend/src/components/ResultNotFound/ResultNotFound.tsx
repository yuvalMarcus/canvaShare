import {Stack, Typography} from "@mui/material";


const ResultNotFound = () => {

    return (
        <Stack justifyContent="center" alignItems="center" gap={2}>
            <img src="/assets/no-results.png" alt="no result" style={{width: '5%'}}/>
            <Typography variant="h4">
                Result not found!</Typography>
            <Typography variant="h6">
                We couldn't find any paints matching your filter</Typography>
        </Stack>
    );
};

export default ResultNotFound;






