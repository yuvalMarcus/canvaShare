import { atom } from 'jotai';

export const brushAtom = atom<'pencil' | 'brush' | 'spray' | null>(null);
export const sizeAtom = atom<number>(1);
export const colorAtom = atom<string>("#000000");