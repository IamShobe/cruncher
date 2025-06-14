
import { parse, parseISO, isValid } from 'date-fns';

export enum DateType {
    Now = "Now",
}

export type FullDate = Date | DateType;

export const isTimeNow = (date: Date | DateType | undefined): date is DateType.Now => {
    return date === DateType.Now;
};


export const compareFullDates = (date1: FullDate, date2: FullDate) => {
    const date1Time = isTimeNow(date1) ? new Date() : date1;
    const date2Time = isTimeNow(date2) ? new Date() : date2;

    return Math.sign(date1Time.getTime() - date2Time.getTime());
};

/**
 * Tries to parse a value into a JavaScript Date using date-fns
 * @param {string|number|Date} input
 * @returns {Date|null}
 */
export const parseDate = (input: unknown): FullDate | null => {
    if (input instanceof Date && isValid(input)) {
        return input;
    }

    if (typeof input === 'string' && input.trim() === 'Now') {
        return DateType.Now;
    }

    // Handle epoch time (number or numeric string)
    if (typeof input === 'number' || (typeof input === 'string' && /^\d+$/.test(input))) {
        const date = new Date(Number(input));
        return isValid(date) ? date : null;
    }

    // Try ISO parsing
    if (typeof input === 'string') {
        let date = parseISO(input);
        if (isValid(date)) return date;

        // Fallback to custom format (e.g. MM/dd/yyyy)
        const knownFormats = [
            'MM/dd/yyyy',
            'yyyy-MM-dd',
            'dd-MM-yyyy',
            'MM-dd-yyyy',
            'yyyy/MM/dd',
            'dd/MM/yyyy',
            'MMM dd, yyyy',
            'MMMM dd, yyyy',
            'EEE MMM dd yyyy HH:mm:ss',
        ];

        for (const format of knownFormats) {
            date = parse(input, format, new Date());
            if (isValid(date)) return date;
        }
    }

    // Could not parse
    return null;
}

export const dateAsString = (date: FullDate): string => {
    if (isTimeNow(date)) {
        return "Now";
    }
    if (date instanceof Date) {
        return date.toISOString();
    }
    throw new Error("Invalid date type");
}