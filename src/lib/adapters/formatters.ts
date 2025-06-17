import { format } from "date-fns";
import { utc } from "@date-fns/utc";

export const formatDataTime = (date: Date | number): string => {
  return format(new Date(date), "yyyy-MM-dd HH:mm:ss.SSS", {
    in: utc,
  });
};

export const formatDataTimeShort = (date: Date | number): string => {
  if (date === undefined) return "";

  return format(new Date(date), "yyyy-MM-dd HH:mm:ss", {
    in: utc,
  });
};
