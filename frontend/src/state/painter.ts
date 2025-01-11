import { atom } from 'jotai';
import {ACTION_TYPE} from "../feature/Canvas/canvas.config.ts";

export const selectedActionAtom = atom<ACTION_TYPE | null>(null);