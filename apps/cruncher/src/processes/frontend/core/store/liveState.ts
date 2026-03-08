import { atom } from "jotai";
import {
  LiveInterval,
  TimezoneOption,
} from "src/processes/server/config/schema";

export const isLiveModeAtom = atom(false);
export const liveIntervalAtom = atom<LiveInterval>("5s");
export const lastLiveRefreshTimeAtom = atom<Date | null>(null);
export const newLogSinceAtom = atom<number | null>(null); // ms timestamp for row highlight animation
export const isLiveFetchingAtom = atom(false); // true while a live fetch is in-flight
export const maxLogsAtom = atom(100000);
// null = never auto-stop; 0 = never auto-stop; positive = minutes until auto-stop
export const liveAutoStopMinutesAtom = atom<number | null>(30);
export const timezoneAtom = atom<TimezoneOption>("local");
