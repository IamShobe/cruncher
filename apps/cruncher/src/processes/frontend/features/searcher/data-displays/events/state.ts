import { atom, useAtomValue } from "jotai";
import { ProcessedData } from "@cruncher/adapter-utils/logTypes";

export const getLogId = (log: ProcessedData): string => {
  return log.id ?? `${log.object._time?.value ?? ""}_${log.message}`;
};

export const openIdsAtom = atom<string[]>([]);

export const useIsLogOpen = () => {
  const openIds = useAtomValue(openIdsAtom);
  return (id: string) => openIds.includes(id);
};

export const rangeInViewAtom = atom<{ start: number; end: number }>({
  start: 0,
  end: 0,
});
