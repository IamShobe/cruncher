import { format, isValid, parse, subMinutes } from "date-fns";
import { atom, PrimitiveAtom } from "jotai";
import { DateRange } from "react-day-picker";
import { store } from "./store";
import { DateType, FullDate, isTimeNow } from "~lib/dateUtils";

export const dateFormat = "yyyy/MM/dd HH:mm:ss";
const dateOnlyFormat = "yyyy/MM/dd";
const dateWithoutSecondsFormat = "yyyy/MM/dd HH:mm";

const defaultEndDate = new Date();
const defaultStartDate = subMinutes(defaultEndDate, 30);

export const startFullDateAtom = atom<FullDate | undefined>(defaultStartDate);
export const endFullDateAtom = atom<FullDate | undefined>(defaultEndDate);

export const actualStartTimeAtom = atom<Date | undefined>();
export const actualEndTimeAtom = atom<Date | undefined>();


const getDateWithTimeFromDateB = (dateA: Date, dateB: Date) => {
    return new Date(
        dateA.getFullYear(),
        dateA.getMonth(),
        dateA.getDate(),
        dateB.getHours(),
        dateB.getMinutes(),
        dateB.getSeconds()
    );
};


const getDateOnly = (date: Date) => {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
};

const getDatePartAtom = (fullDateAtom: PrimitiveAtom<Date | DateType | undefined>) => atom(
    (get) => {
        const fullDate = get(fullDateAtom);
        if (!fullDate) {
            return undefined;
        }

        if (isTimeNow(fullDate)) {
            return fullDate;
        }

        return getDateOnly(fullDate);
    },
    (get, set, update: Date | undefined) => {
        if (!update) {
            set(fullDateAtom, undefined);
            return;
        }

        const existingData = get(fullDateAtom);
        if (!existingData) {
            set(fullDateAtom, update);
            return;
        }

        const timeToReuse = isTimeNow(existingData) ? new Date() : existingData;

        return set(
            fullDateAtom,
            getDateWithTimeFromDateB(update, timeToReuse),
        );
    }
)

export const startDateAtom = getDatePartAtom(startFullDateAtom);
export const endDateAtom = getDatePartAtom(endFullDateAtom);

export const dateRangeAtom = atom(
    (get) => {
        const startDate = get(startDateAtom);
        const endDate = get(endDateAtom);

        if (!startDate && !endDate) {
            return undefined;
        }

        return {
            from: startDate,
            to: endDate,
        };
    },
    (_get, set, update: DateRange | undefined) => {
        if (!update) {
            set(startDateAtom, undefined);
            set(endDateAtom, undefined);
            return;
        }

        if (update.from) {
            set(startDateAtom, update.from);
        }

        if (update.to) {
            set(endDateAtom, update.to);
        }
    }
);

export const compareFullDates = (date1: FullDate, date2: FullDate) => {
    const date1Time = isTimeNow(date1) ? new Date() : date1;
    const date2Time = isTimeNow(date2) ? new Date() : date2;

    return Math.sign(date1Time.getTime() - date2Time.getTime());
};

const formatTime = (date: FullDate | undefined) => {
    if (!date) {
        return "";
    }

    if (isTimeNow(date)) {
        return "Now";
    }

    return format(date, dateFormat);
};

const renderedDateAtom = (dateAtom: PrimitiveAtom<FullDate | undefined>) => atom((get) => {
    return formatTime(get(dateAtom));
});

export const tryToUpdateDate = (dateAtom: PrimitiveAtom<FullDate | undefined>, update: string) => {
    const fullDate = store.get(dateAtom);
    if (update.toLowerCase() === "now") {
        store.set(dateAtom, DateType.Now);
        return;
    }
    const res = parse(update, dateFormat, fullDate ?? new Date());
    if (isValid(res)) {
        store.set(dateAtom, res);
        return;
    }

    const dateWithoutSeconds = parse(
        update,
        dateWithoutSecondsFormat,
        fullDate ?? new Date()
    );
    if (isValid(dateWithoutSeconds)) {
        store.set(dateAtom, dateWithoutSeconds);
        return;
    }

    const dateOnly = parse(
        update,
        dateOnlyFormat,
        fullDate ?? new Date()
    );
    if (isValid(dateOnly)) {
        store.set(dateAtom, dateOnly);
        return;
    }
}

export const renderedStartDateAtom = renderedDateAtom(startFullDateAtom);
export const renderedEndDateAtom = renderedDateAtom(endFullDateAtom);
