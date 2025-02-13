import {TableCellId} from "./TableCellId/TableCellId.tsx";
import {TableCellImage} from "./TableCellImage/TableCellImage.tsx";
import {TableCellBool} from "./TableCellBool/TableCellBool.tsx";
import {TableCellDate} from "./TableCellDate/TableCellDate.tsx";
import {TableCellDefault} from "./TableCellDefault/TableCellDefault.tsx";

export const tableCellByType = {
    ['id']: TableCellId,
    ['image']: TableCellImage,
    ['bool']: TableCellBool,
    ['date']: TableCellDate,
    ['default']: TableCellDefault,
}