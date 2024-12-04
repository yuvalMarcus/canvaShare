import { atom } from 'jotai';

export const isLoginAtom = atom<boolean>(!!localStorage.getItem('token'));