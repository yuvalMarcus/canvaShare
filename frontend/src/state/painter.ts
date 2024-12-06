import { atom } from 'jotai';
import {ACTION_TYPE} from "../feature/Painter/painter.config.ts";

export const selectedActionAtom = atom<ACTION_TYPE | null>(null);