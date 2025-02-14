import {TableCellId} from "./TableCellId/TableCellId.tsx";
import {TableCellImage} from "./TableCellImage/TableCellImage.tsx";
import {TableCellBool} from "./TableCellBool/TableCellBool.tsx";
import {TableCellDate} from "./TableCellDate/TableCellDate.tsx";
import {TableCellDefault} from "./TableCellDefault/TableCellDefault.tsx";
import {TableCellRoles} from "./TableCellRoles/TableCellRoles.tsx";

export const tableCellByType = {
    ['id']: TableCellId,
    ['image']: TableCellImage,
    ['bool']: TableCellBool,
    ['date']: TableCellDate,
    ['roles']: TableCellRoles,
    ['default']: TableCellDefault,
}