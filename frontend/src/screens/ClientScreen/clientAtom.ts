import { atom, useAtom } from "jotai";

export const currentClientAtom = atom(undefined as string | undefined);
export const setCurrentClientAtom = atom(
  null,
  (_, set, update: string | undefined) => {
    set(currentClientAtom, update);
  }
);

export const useCurrentClient = () => {
  return useAtom(currentClientAtom);
};
