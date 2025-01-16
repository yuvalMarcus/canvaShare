import {IconButton, Stack} from "@mui/material";
import {grey} from "@mui/material/colors";
import Shape from "./Shape/Shape.tsx";
import React, {FC, Fragment, MutableRefObject, useState} from "react";
import CloseIcon from "@mui/icons-material/Close";
import {ACTION_TYPE} from "../../paint.config.ts";
import Text from "./Text/Text.tsx";
import Photo from "./Photo/Photo.tsx";
import {Canvas} from "fabric";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface EditMenuProps {
    canvas: MutableRefObject<Canvas | null>;
    selectedId: string | null;
}

const EditMenu: FC<EditMenuProps> = ({canvas, selectedId}) => {
    const [isOpen, setIsOpen] = useState<boolean>(true);

    const object = canvas.current?.getObjects().find(({data}) => data?.id === selectedId);

    const category = object?.data.category;

    const onClose = () => {
        canvas.current?.discardActiveObject();
        canvas.current?.renderAll();
    }

    return (
        <Stack position="absolute" top={-60} right={8} zIndex={10} boxShadow={2} px={2} py={1} minWidth={200} bgcolor={grey[800]}>
            <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
                <IconButton onClick={() => setIsOpen(prev => !prev)} sx={{ px: 0 }}>
                    {isOpen ? <ArrowDropUpIcon sx={{ color: grey[100] }} /> : <ArrowDropDownIcon sx={{ color: grey[100] }} />}
                </IconButton>
                <IconButton onClick={onClose}>
                    <CloseIcon sx={{ color: grey[100] }} />
                </IconButton>
            </Stack>
            {isOpen && <Fragment>
                {category === ACTION_TYPE.TEXT && <Text canvas={canvas} selectedId={selectedId} onClose={onClose} />}
                {category === ACTION_TYPE.SHAPE && <Shape canvas={canvas} selectedId={selectedId} onClose={onClose} />}
                {category === ACTION_TYPE.PHOTO && <Photo canvas={canvas} selectedId={selectedId} onClose={onClose} />}
            </Fragment>}
        </Stack>
    )
}

export default EditMenu;