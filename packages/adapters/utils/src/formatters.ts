import { format } from "date-fns";
import { utc } from "@date-fns/utc";

export type Timezone = "local" | "utc";

const tzOptions = (timezone: Timezone) =>
  timezone === "utc" ? { in: utc } : undefined;

export const formatDataTime = (
  date: Date | number,
  timezone: Timezone = "local",
): string => {
  return format(new Date(date), "yyyy-MM-dd HH:mm:ss.SSS", tzOptions(timezone));
};

export const formatDataTimeShort = (
  date: Date | number,
  timezone: Timezone = "local",
): string => {
  if (date === undefined) return "";

  return format(new Date(date), "yyyy-MM-dd HH:mm:ss", tzOptions(timezone));
};
