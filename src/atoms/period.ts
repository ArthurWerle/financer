import { Period } from "@/types";
import { atom } from "jotai";

export const periodAtom = atom<Period | null>(null)