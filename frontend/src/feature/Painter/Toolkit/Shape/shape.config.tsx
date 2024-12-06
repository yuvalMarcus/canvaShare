import React, {ReactNode} from "react";
import {Box} from "@mui/material";
import {blue, grey} from "@mui/material/colors";

export enum SHAPE_TYPE {
    SQUARE = 'square',
    CIRCLE = 'circle',
    RECTANGLE = 'rectangle',
    TRIANGULAR = 'triangular',
}

export const mapShapeToIcon: Record<SHAPE_TYPE, (isSelected: boolean, onClick: () => void) => ReactNode> = {
    [SHAPE_TYPE.SQUARE]: (isSelected, onClick) => <Box width={25} height={25} onClick={onClick} bgcolor={isSelected ? blue[300] : grey[300]} />,
    [SHAPE_TYPE.CIRCLE]: (isSelected, onClick) => <Box width={25} height={25} borderRadius={25} onClick={onClick} bgcolor={isSelected ? blue[300] : grey[300]} />,
    [SHAPE_TYPE.RECTANGLE]: (isSelected, onClick) => <Box width={50} height={25} onClick={onClick} bgcolor={isSelected ? blue[300] : grey[300]} />,
    [SHAPE_TYPE.TRIANGULAR]: (isSelected, onClick) => (
        <Box width={0} height={0} borderLeft='12.5px solid transparent' borderRight='12.5px solid transparent' borderBottom={`25px solid ${isSelected ? blue[300] : grey[300]}`} onClick={onClick} />
    )
}

export const DEFAULT_SIZE = 1;

export const DEFAULT_COLOR = grey[900];