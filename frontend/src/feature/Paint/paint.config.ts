import DrawIcon from '@mui/icons-material/Draw';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import {OverridableComponent} from "@mui/material/OverridableComponent";
import {SvgIconTypeMap} from "@mui/material";

export enum ACTION_TYPE {
    DRAW = 'draw',
    TEXT = 'text',
    SHAPE = 'shape',
    PHOTO = 'photo'
}

export const mapActionToIcon: Record<ACTION_TYPE, OverridableComponent<SvgIconTypeMap>> = {
    [ACTION_TYPE.DRAW]: DrawIcon,
    [ACTION_TYPE.TEXT]: TextFormatIcon,
    [ACTION_TYPE.SHAPE]: CropSquareIcon,
    [ACTION_TYPE.PHOTO]: InsertPhotoIcon,
}