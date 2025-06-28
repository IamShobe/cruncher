export type TimestampValues = number[];
export type ObjectValues = Record<string, string>[];
export type FormatedValues = string[];
export type NanoSeconds = string[]; // nano seconds in string format
export type IndexInfo = object[]; // index info
export type UniqueId = string[]; // unique id

export type Frame = {
  data: {
    values: [
      ObjectValues,
      TimestampValues,
      FormatedValues,
      NanoSeconds,
      IndexInfo,
      UniqueId,
    ];
  };
};

export type Result = {
  status: number;
  frames: Frame[];
};

export type Results = {
  [key: string]: Result;
};

export type QueryResponse = {
  results: Results;
};
