import { DisplayResults } from "~lib/displayTypes";
import { isNotDefined } from "~lib/adapters/logTypes";
import { Order } from "~lib/qql/grammar";

export const processSort = (data: DisplayResults, rules: {name: string, order: Order}[]): DisplayResults => {
    const {events, table} = data;
    const dataPoints = table ? table.dataPoints : events.data;

    // mutates inplace
    dataPoints.sort((a, b) => {
        for (const rule of rules) {
            const aValue = a.object[rule.name];
            const bValue = b.object[rule.name];

            if (isNotDefined(aValue) && isNotDefined(bValue)) {
                continue;
            }

            if (isNotDefined(aValue)) {
                return rule.order === "asc" ? -1 : 1;
            }

            if (isNotDefined(bValue)) {
                return rule.order === "asc" ? 1 : -1;
            }

            if (aValue.type !== bValue.type) {
                continue;
            }

            if (aValue.value === bValue.value) {
                continue;
            }

            if (aValue.type === "date" && bValue.type === "date") {
                const aDate = aValue.value;
                const bDate = bValue.value;

                if (rule.order === "asc") {
                    return aDate - bDate;
                } else {
                    return bDate - aDate;
                }
            } else if (aValue.type === "string" && bValue.type === "string") {
                const aString = aValue.value;
                const bString = bValue.value;

                if (rule.order === "asc") {
                    return aString.localeCompare(bString);
                } else {
                    return bString.localeCompare(aString);
                }
            } else if (aValue.type === "number" && bValue.type === "number") {
                const aNumber = aValue.value;
                const bNumber = bValue.value;

                if (rule.order === "asc") {
                    return aNumber - bNumber;
                } else {
                    return bNumber - aNumber;
                }
            } else if (aValue.type === "boolean" && bValue.type === "boolean") {
                const aBoolean = aValue.value;
                const bBoolean = bValue.value;

                if (rule.order === "asc") {
                    return aBoolean ? -1 : 1;
                } else {
                    return bBoolean ? -1 : 1;
                }
            } else if (aValue.type === "array" && bValue.type === "array") {
                const aArray = aValue.value;
                const bArray = bValue.value;

                if (rule.order === "asc") {
                    return aArray.length - bArray.length;
                } else {
                    return bArray.length - aArray.length;
                }
            } else if (aValue.type === "object" && bValue.type === "object") {
                const aObject = aValue.value;
                const bObject = bValue.value;

                if (rule.order === "asc") {
                    return Object.keys(aObject).length - Object.keys(bObject).length;
                } else {
                    return Object.keys(bObject).length - Object.keys(aObject).length;
                }
            }
        }

        return 0;
    });

    return {
        events,
        table,
        view: undefined,
    }
}
