import type { IPlan } from "@/screens/ManagePlansScreen";
import { atom } from "jotai";

export const selectPlanAtom = atom<null | IPlan>(null);
