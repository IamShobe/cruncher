import { QueryOptions, QueryProvider } from "~lib/adapters";
import { asNumberField, Field, ObjectFields, ProcessedData } from "~lib/adapters/logTypes";
import { ControllerIndexParam, Search, SearchAND, SearchLiteral, SearchOR } from "~lib/qql/grammar";

const tagsOptions = ["nice", "developer", "collector"];
const data = [
    {
        key: "1",
        name: "John Brown",
        age: 32,
        address: "New York No. 1 Lake Park",
        tags: ["nice", "developer"],
    },
];

for (let i = 2; i <= 100000; i++) {
    const randomTags = [
        tagsOptions[Math.floor(Math.random() * tagsOptions.length)],
        tagsOptions[Math.floor(Math.random() * tagsOptions.length)],
    ];

    // generate random field keys
    const fields: Record<string, string> = {};

    const randomFieldsCount = Math.floor(Math.random() * 10) + 1;
    for (let j = 0; j < randomFieldsCount; j++) {
        fields[`field${j}`] = `value${j}`;
    }


    data.push({
        key: i.toString(),
        name: `Name ${i}`,
        age: 20 + (i % 50),
        address: `Address ${i}`,
        tags: randomTags,
        ...fields,
    });
}

const processField = (field: unknown): Field => {
    if (field === null || field === undefined) {
        return null;
    }

    if (typeof field === "number") {
        return {
            type: "number",
            value: field,
        };
    } else if (field instanceof Date) {
        return {
            type: "date",
            value: field.getTime(),
        };
    } else if (typeof field === "boolean") {
        return {
            type: "boolean",
            value: field,
        };
    } else if (Array.isArray(field)) {
        return {
            type: "array",
            value: field.map((item) => processField(item)),
        };
    } else if (typeof field === "object") {
        const objectFields: ObjectFields = {};

        Object.entries(field ?? {}).forEach(([key, value]) => {
            objectFields[key] = processField(value);
        });

        return {
            type: "object",
            value: objectFields,
        };
    } else if (typeof field === "string") {
        // try to parse as number
        if (/^\d+(?:\.\d+)?$/.test(field)) {
            return {
                type: "number",
                value: parseFloat(field),
            };
        }

        return {
            type: "string",
            value: field,
        };
    }

    throw new Error(`Unsupported field type: ${typeof field}`);
}

type SearchCallback = (item: string) => boolean;

const buildSearchAndCallback = (leftCallback: SearchCallback, search: SearchAND) => {
    return (item: string) => {
        const leftRes = leftCallback(item);
        if (!leftRes) {
            return false;
        }

        const rightRes = buildSearchCallback(search.right)(item);

        return rightRes;
    }
}

const buildSearchOrCallback = (leftCallback: SearchCallback, search: SearchOR) => {
    return (item: string) => {
        const leftRes = leftCallback(item);
        if (leftRes) {
            return true;
        }

        const rightRes = buildSearchCallback(search.right)(item);

        return rightRes;
    }
}

const buildSearchLiteralCallback = (searchLiteral: SearchLiteral) => {
    if (searchLiteral.tokens.length === 0) {
        return () => true;
    }

    return (searchTerm: string) => searchLiteral.tokens.every((token) => {
        return searchTerm.includes(String(token));
    });
}

const buildSearchCallback = (searchTerm: Search) => {
    const left = searchTerm.left;
    const right = searchTerm.right;

    let leftCallback: SearchCallback;
    switch (left.type) {
        case "search":
            leftCallback = buildSearchCallback(left);
            break;
        case "searchLiteral":
            leftCallback = buildSearchLiteralCallback(left);
            break;
    }

    if (!right) {
        return leftCallback;
    }

    let rightCallback: SearchCallback;
    switch (right.type) {
        case "and":
            rightCallback = buildSearchAndCallback(leftCallback, right);
            break;
        case "or":
            rightCallback = buildSearchOrCallback(leftCallback, right);
            break;
    }

    return rightCallback;
}

// Used for testing purposes
export const MockController = {
    query: async (contollerParams: ControllerIndexParam[], searchTerm: Search, options: QueryOptions): Promise<void> => {
        if (contollerParams.length > 0) {
            throw new Error("Controller params not supported");
        }

        const searchCallback = buildSearchCallback(searchTerm);
        return new Promise((resolve, reject) => {
            // filter using the search term
            const itemToMessage = (item: typeof data[number]) => {
                return `Name: ${item.name}, Age: ${item.age}, Address: ${item.address}, Tags: ${item.tags.join(", ")}`;
            }
            const filteredData = data.filter((item) => {
                const message = itemToMessage(item);
                return [item.name, item.address, message, ...item.tags].some((field) => {
                    return searchCallback(field);
                })
            });

            const fromTime = options.fromTime;
            const toTime = options.toTime;


            // convert the data to ProcessedData
            const result = filteredData.map<ProcessedData>((item) => {
                // get random time between fromTime and toTime
                const randomTime = Math.floor(Math.random() * (toTime.getTime() - fromTime.getTime())) + fromTime.getTime();
                const fields: ObjectFields = {
                    _time: {
                        type: "date",
                        value: randomTime,
                    },
                    _raw: {
                        type: "string",
                        value: JSON.stringify(item),
                    }
                };
                Object.entries(item).forEach(([key, value]) => {
                    fields[key] = processField(value);
                });

                return {
                    object: fields,
                    message: itemToMessage(item),
                };
            });

            // sort by timestamp
            result.sort((a, b) => {
                return asNumberField(b.object._time).value - asNumberField(a.object._time).value;
            });

            // randomize a delay between 1 - 3 seconds
            const delay = Math.floor(Math.random() * 1000) + 500;

            // simulate a delay - and listen to options.cancelToken as well - reject if cancelled
            const timeout = setTimeout(() => {
                options.onBatchDone(result);
                resolve();
            }, delay);

            options.cancelToken.addEventListener("abort", () => {
                clearTimeout(timeout);
                reject("Query cancelled");
            });
        });
    },
    getControllerParams(): Promise<Record<string, string[]>> {
        return Promise.resolve({
            "label1": ["value1", "value2", "value3"],
        });
    },
} satisfies QueryProvider;
