import React from "react";
import {Box, FormControl, MenuItem, Select, Slider, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import {RgbaColor, RgbaColorPicker} from "react-colorful";
import {grey} from "@mui/material/colors";
import useBrush from "../../../../hooks/painter/useBrush.ts";
const Brushes = () => {
    const { brush, size, color, setBrush, setSize, setColor } = useBrush();

    return (
        <Stack gap={2} pb={2}>
            <Box>
                <Typography color={grey[800]} fontSize={18} mb={1}>Type</Typography>
                <FormControl variant="standard" fullWidth>
                    <Select
                        value={brush ?? "brush"}
                        onChange={({target}) => setBrush(target.value)}
                    >
                        <MenuItem value="brush">Brush</MenuItem>
                        <MenuItem value="pencil">Pencil</MenuItem>
                        <MenuItem value="spray">Spray</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Box>
                <Typography color={grey[800]} fontSize={18} mb={1}>Size</Typography>
                <Slider defaultValue={30} value={size || 30} onChange={({ target }) => setSize(target.value)} />
            </Box>
            <Box>
                <Typography color={grey[800]} fontSize={18} mb={2}>Color Picker</Typography>
                <Box px={1}>
                    <RgbaColorPicker color={color ?? ({a: null, b: 0, g: 0, r: 0} as RgbaColor)} onChange={setColor} />
                </Box>
            </Box>
        </Stack>
    )
}

export default Brushes;