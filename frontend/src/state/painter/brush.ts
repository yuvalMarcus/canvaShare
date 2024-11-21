import { atom } from 'jotai';
import {RgbaColor} from "react-colorful";

export const brushAtom = atom<'pencil' | 'brush' | 'spray' | null>(null);
export const sizeAtom = atom<number | null>(null);
export const colorAtom = atom<RgbaColor | null>(null);