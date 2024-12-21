import {SvgIconTypeMap} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import BrushIcon from "@mui/icons-material/Brush";
import {OverridableComponent} from "@mui/material/OverridableComponent";
import WorkspacesIcon from '@mui/icons-material/Workspaces';

export enum DRAW_TYPE {
    PENCIL = 'pencil',
    BRUSH = 'brush',
    SPRAY = 'spray'
}

export const mapDrawTypeToIcon: Record<DRAW_TYPE, OverridableComponent<SvgIconTypeMap>> = {
    [DRAW_TYPE.PENCIL]: EditIcon,
    [DRAW_TYPE.BRUSH]: BrushIcon,
    [DRAW_TYPE.SPRAY]: WorkspacesIcon,
}