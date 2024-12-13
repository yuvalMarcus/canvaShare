import {camelCase} from 'lodash';
export const objectToCamelCase = (data: Object) => {
    return Object.entries(data).reduce((prev, [key, value]) => {
        const isObject = typeof value === 'object' && !Array.isArray(value) && value !== null;

        prev[camelCase(key)] = isObject ? objectToCamelCase(value) : value;
        return prev;
    }, {});
}