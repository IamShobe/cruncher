import { IRecognitionException } from "chevrotain";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";
import { Suggestion } from "~components/ui/editor/AutoCompleter";
import { Editor as EditorComponent } from "~components/ui/editor/Editor";
import { HighlightData } from "~components/ui/editor/Highlighter";
import { SUPPORTED_AGG_FUNCTIONS } from "~lib/pipelineEngine/aggregateData";
import {
  isBooleanFunction,
  SUPPORTED_BOOLEAN_FUNCTIONS,
} from "~lib/pipelineEngine/logicalExpression";
import { HighlightData as ParserHighlightData } from "~lib/qql/grammar";
import { getPopperRoot } from "./shadowUtils";
import {
  availableColumnsAtom,
  availableControllerParamsAtom,
  queryDataAtom,
} from "./store/queryState";

export const queryEditorAtom = atom<HTMLTextAreaElement | null>(null);

export type EditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const translateHighlightData = (
  value: string,
  parserHighlightData: ParserHighlightData
): HighlightData => {
  const { startOffset, endOffset } = parserHighlightData.token;
  // get word
  const word = value.slice(startOffset, (endOffset ?? startOffset) + 1);
  if (isBooleanFunction(word)) {
    return {
      type: "booleanFunction",
      token: {
        startOffset,
        endOffset,
      },
    };
  }
  return parserHighlightData;
};

export const Editor = ({ value, onChange }: EditorProps) => {
  const availableColumns = useAtomValue(availableColumnsAtom);
  const data = useAtomValue(queryDataAtom);
  const setQueryEditor = useSetAtom(queryEditorAtom);
  const availableControllerParams = useAtomValue(availableControllerParamsAtom);
  const highlightData = useMemo<HighlightData[]>(() => {
    const errorHighlightData = data.parserError.map(
      (error: IRecognitionException) => {
        return {
          type: "error",
          message: error.message,
          token: {
            startOffset: error.token.startOffset,
            endOffset: error.token.endOffset,
          },
        };
      }
    );

    const processedHighlightData = data.highlight.map((highlight) =>
      translateHighlightData(value, highlight)
    );

    return [...processedHighlightData, ...errorHighlightData];
  }, [value, data]);

  const suggestions = useMemo(() => {
    const results: Suggestion[] = [];
    for (const suggestion of data.suggestions ?? []) {
      switch (suggestion.type) {
        case "params":
          results.push(
            ...suggestion.keywords.map(
              (keyword) =>
                ({
                  type: "param",
                  value: keyword,
                  fromPosition: suggestion.fromPosition,
                  toPosition: suggestion.toPosition,
                }) satisfies Suggestion
            )
          );
          break;
        case "keywords":
          results.push(
            ...suggestion.keywords.map(
              (keyword) =>
                ({
                  type: "keyword",
                  value: keyword,
                  fromPosition: suggestion.fromPosition,
                  toPosition: suggestion.toPosition,
                }) satisfies Suggestion
            )
          );
          break;
        case "column":
          availableColumns.forEach((column) =>
            results.push({
              type: "variable",
              value: column,
              fromPosition: suggestion.fromPosition,
              toPosition: suggestion.toPosition,
            })
          );
          break;
        case "function":
          SUPPORTED_AGG_FUNCTIONS.forEach((func) =>
            results.push({
              type: "function",
              value: func,
              fromPosition: suggestion.fromPosition,
              toPosition: suggestion.toPosition,
            })
          );
          break;
        case "booleanFunction":
          SUPPORTED_BOOLEAN_FUNCTIONS.forEach((func) =>
            results.push({
              type: "function",
              value: func,
              fromPosition: suggestion.fromPosition,
              toPosition: suggestion.toPosition,
            })
          );
          break;
        case "controllerParam":
          Object.keys(availableControllerParams).forEach((param) =>
            results.push({
              type: "param",
              value: param,
              fromPosition: suggestion.fromPosition,
              toPosition: suggestion.toPosition,
            })
          );
          break;
        case "paramValue": {
          const paramValues = availableControllerParams[suggestion.key];
          if (!paramValues) {
            continue;
          }

          paramValues.forEach((value) =>
            results.push({
              type: "variable",
              value: value,
              fromPosition: suggestion.fromPosition,
              toPosition: suggestion.toPosition,
            })
          );
          break;
        }
      }
    }
    return results;
  }, [data]);

  const popperRoot = getPopperRoot();

  return (
    <EditorComponent
      popperRoot={popperRoot}
      ref={setQueryEditor}
      value={value}
      onChange={onChange}
      highlightData={highlightData}
      suggestions={suggestions}
    />
  );
};
