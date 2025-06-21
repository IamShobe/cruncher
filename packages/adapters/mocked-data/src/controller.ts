import { QueryOptions, QueryProvider } from "@cruncher/adapter-utils";
import {
  asNumberField,
  ObjectFields,
  ProcessedData,
  processField,
} from "@cruncher/adapter-utils/logTypes";
import { ControllerIndexParam, Search } from "@cruncher/qql/grammar";
import { buildDoesLogMatchCallback } from "@cruncher/qql/searchTree";

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

// Used for testing purposes
export const MockController = {
  query: async (
    contollerParams: ControllerIndexParam[],
    searchTerm: Search,
    options: QueryOptions,
  ): Promise<void> => {
    if (contollerParams.length > 0) {
      throw new Error("Controller params not supported");
    }

    const doesLogMatch = buildDoesLogMatchCallback(searchTerm);
    return new Promise((resolve, reject) => {
      // filter using the search term
      const itemToMessage = (item: (typeof data)[number]) => {
        return `Name: ${item.name}, Age: ${item.age}, Address: ${item.address}, Tags: ${item.tags.join(", ")}`;
      };
      const filteredData = data.filter((item) => {
        const message = itemToMessage(item);
        return [item.name, item.address, message, ...item.tags].some(
          (field) => {
            return doesLogMatch(field);
          },
        );
      });

      const fromTime = options.fromTime;
      const toTime = options.toTime;

      // convert the data to ProcessedData
      const result = filteredData.map<ProcessedData>((item) => {
        // get random time between fromTime and toTime
        const randomTime =
          Math.floor(Math.random() * (toTime.getTime() - fromTime.getTime())) +
          fromTime.getTime();
        const fields: ObjectFields = {
          _time: {
            type: "date",
            value: randomTime,
          },
          _raw: {
            type: "string",
            value: JSON.stringify(item),
          },
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
        return (
          asNumberField(b.object._time).value -
          asNumberField(a.object._time).value
        );
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
      label1: ["value1", "value2", "value3"],
    });
  },
} satisfies QueryProvider;
