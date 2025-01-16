import {camelCase, snakeCase} from 'lodash';

export const objectToCamelCase = (data: Object) => {
    const isValue = typeof data !== 'object' && !Array.isArray(data) && data !== null;

    if(isValue) return data;

    const isArray = Array.isArray(data) && data !== null;

    if(isArray) return data.map(objectToCamelCase);

    return Object.entries(data).reduce((prev, [key, value]) => {
        const isObject = typeof value === 'object' && value !== null;

        prev[camelCase(key)] = isObject ? objectToCamelCase(value) : value;
        return prev;
    }, {});
}

export const objectToSnakeCase = (data: Object) => {
    if(data instanceof FormData) return data;

    const isArray = Array.isArray(data) && data !== null;
    if(isArray) return data.map(objectToSnakeCase);

    return Object.entries(data).reduce((prev, [key, value]) => {
        const isObject = typeof value === 'object' && !Array.isArray(value) && value !== null;

        prev[snakeCase(key)] = isObject ? objectToSnakeCase(value) : value;
        return prev;
    }, {});
}