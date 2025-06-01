import { format } from "date-fns";


export const formatDataTime = (date: Date | number): string => {
    return format(new Date(date), "yyyy-MM-dd HH:mm:ss.SSS")
}

export const formatDataTimeShort = (date: Date | number): string => {
    if (date === undefined) return "";

    return format(new Date(date), "yyyy-MM-dd HH:mm:ss")
}
