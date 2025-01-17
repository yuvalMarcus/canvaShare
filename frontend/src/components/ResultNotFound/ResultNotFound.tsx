import {Stack, Typography} from "@mui/material";
import {grey} from "@mui/material/colors";


const ResultNotFound = () => {

    return (
        <Stack justifyContent="center" alignItems="center" gap={2}>
            <img src="/assets/no-results.png" alt="no result" height={120} />
            <Typography variant="h4" color={grey[800]}>Result not found!</Typography>
            <Typography fontSize={18} color={grey[600]}>
                We couldn't find any paints matching your filter
            </Typography>
        </Stack>
    );
};

export default ResultNotFound;






