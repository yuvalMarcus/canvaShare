import ImageModal from "../../../../ImageModal/ImageModal.tsx";
import {FC} from "react";

interface TableCellImageProps {
    value: string;
}

export const TableCellImage: FC<TableCellImageProps> = ({ value }) => {
    return (
        <>
            {value && <ImageModal link={value}/>}
        </>
    )
}