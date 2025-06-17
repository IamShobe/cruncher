import { atom, useAtomValue } from "jotai";

export const openIndexesAtom = atom<number[]>([]);

export const useIsIndexOpen = () => {
  const openIndexes = useAtomValue(openIndexesAtom);
  return (index: number) => {
    return openIndexes.includes(index);
  };
};

export const rangeInViewAtom = atom<{ start: number; end: number }>({
  start: 0,
  end: 0,
});
