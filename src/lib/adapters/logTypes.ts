import { formatDataTime } from "./formatters";

export type ProcessedData = {
  object: ObjectFields
  message: string;
};

export type ObjectFields = {
  [key: string]: Field;
}

export type FieldWithError = {
  errors?: string[];
}

export type NumberField = {
  type: "number";
  value: number;
} & FieldWithError;

export type StringField = {
  type: "string";
  value: string;
} & FieldWithError;

export type DateField = {
  type: "date";
  value: number;
} & FieldWithError;

export type ArrayField = {
  type: "array";
  value: Field[];
} & FieldWithError;

export type ObjectField = {
  type: "object";
  value: ObjectFields;
} & FieldWithError;

export type BooleanField = {
  type: "boolean";
  value: boolean;
} & FieldWithError;

export type HashableField =
  | NumberField
  | StringField
  | DateField;

export type FieldMust =
  | HashableField
  | BooleanField
  | ArrayField
  | ObjectField
  ;

export type Field =
  | FieldMust
  | undefined | null;


export const asStringFieldOrUndefined = (field: Field): StringField | undefined => {
  if (field?.type === "string") {
    return field;
  }

  return undefined;
}

export const asStringField = (field: Field): StringField => {
  const result = asStringFieldOrUndefined(field);
  if (!result) {
    return {
      type: "string",
      value: "",
      errors: ["Invalid string"],
    }
  }

  return result;
}

export const asNumberFieldOrUndefined = (field: Field): NumberField | undefined => {
  if (field?.type === "number") {
    return field;
  }

  if (typeof field?.value === "number") { // if field value is numeric - we can cast it to number
    return {
      type: "number",
      value: field.value,
    };
  }

  return undefined;
}

export const isNumberField = (field: Field): field is NumberField => {
  return field?.type === "number" || (typeof field?.value === "number");
}

export const asNumberField = (field: Field): NumberField => {
  const result = asNumberFieldOrUndefined(field);
  if (!result) {
    return {
      type: "number",
      value: NaN,
      errors: ["Invalid number"],
    }
  }

  return result;
}

export const asJson = (field: Field): string => {
  if (!field) {
    return "<null>";
  }


  if (field.type === "object") {
    const results: Record<string, unknown> = {};
    for (const key in field.value) {
      results[key] = asJson(field.value[key]);
    }

    return JSON.stringify(results);
  }

  if (field.type === "array") {
    return JSON.stringify(field.value.map(asJson));
  }

  return field.value.toString();
}

export const asDisplayString = (field: Field): string => {
  if (!field) {
    return "<null>";
  }

  if (field.type === "date") {
    return formatDataTime(field.value);
  }

  if (field.type === "object" || field.type === "array") {
    return asJson(field);
  }

  return field.value.toString();
}

export const asDateField = (field: Field): DateField => {
  if (field?.type === "date") {
    return field;
  }

  if (typeof field?.value === "number") {
    return {
      type: "date",
      value: field.value,
    };
  }

  return {
    type: "date",
    value: 0,
    errors: ["Invalid date"],
  }
}

export const getTimeFromProcessedData = (data: ProcessedData): number => {
  if (data.object._time) {
    return asDateField(data.object._time).value;
  }

  return 0;
}

export const compareProcessedData = (a: ProcessedData, b: ProcessedData): number => {
  return getTimeFromProcessedData(b) - getTimeFromProcessedData(a);
}

export const isNotDefined = (field: Field): field is null | undefined => {
  return field === undefined || field === null;
}

export const isHashableField = (field: Field): field is HashableField => {
  return field?.type === "number" || field?.type === "string" || field?.type === "date";
}

export const toJsonObject = (data: ProcessedData) => {
  const result: Record<string, string | number | boolean | null | undefined> = {};
  for (const key in data.object) {
    if (isNotDefined(data.object[key])) {
      result[key] = data.object[key];
      continue;
    }

    const field = data.object[key];
    if (field.type === "object" || field.type === "array") {
      result[key] = asJson(field);
      continue;
    }

    result[key] = field.value;
  }

  return result;
}
