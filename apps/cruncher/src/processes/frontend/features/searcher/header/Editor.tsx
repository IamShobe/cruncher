import type { QQLParserErrorDetail } from "@cruncher/qql";
import { atom, useAtomValue, useSetAtom } from "jotai";
import React, { ReactNode, useMemo } from "react";
import { Suggestion } from "~components/ui/editor/AutoCompleter";
import { Editor as EditorComponent } from "~components/ui/editor/Editor";
import { HighlightData } from "~components/ui/editor/Highlighter";
import { SUPPORTED_AGG_FUNCTIONS } from "~lib/pipelineEngine/aggregateData";
import {
  isBooleanFunction,
  SUPPORTED_BOOLEAN_FUNCTIONS,
} from "~lib/pipelineEngine/logicalExpression";
import { HighlightData as ParserHighlightData } from "@cruncher/qql/grammar";
import { getPopperRoot } from "~core/utils/shadowUtils";
import { availableColumnsAtom, queryDataAtom } from "~core/store/queryState";
import { useControllerParams } from "~core/search";
import styled from "@emotion/styled";
import { token } from "~components/ui/system";

const EditorErrorBox = styled.div`
  display: flex;
  align-items: center;
  gap: ${token("spacing.2")};
  padding: ${token("spacing.2")} ${token("spacing.3")};
  border-radius: ${token("radii.md")};
  border: 1px solid ${token("colors.border")};
  background-color: ${token("colors.bg.muted")};
  color: ${token("colors.fg.muted")};
  font-size: 0.8rem;
  flex: 1;
  min-width: 0;
`;

const EditorErrorReset = styled.button`
  flex-shrink: 0;
  padding: ${token("spacing.1")} ${token("spacing.2")};
  border-radius: ${token("radii.md")};
  border: 1px solid ${token("colors.border")};
  background: transparent;
  color: ${token("colors.fg.muted")};
  font-size: 0.75rem;
  cursor: pointer;
  &:hover {
    background-color: ${token("colors.bg")};
  }
`;

export class EditorErrorBoundary extends React.Component<
  { children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("Editor error:", error);
  }

  render() {
    if (this.state.error) {
      const stack = this.state.error.stack ?? this.state.error.message;
      return (
        <EditorErrorBox>
          <span title={this.state.error.message} style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Editor error: {this.state.error.message}
          </span>
          <EditorErrorReset onClick={() => navigator.clipboard.writeText(stack)}>
            Copy
          </EditorErrorReset>
          <EditorErrorReset onClick={() => this.setState({ error: null })}>
            Reset
          </EditorErrorReset>
        </EditorErrorBox>
      );
    }
    return this.props.children;
  }
}

export const queryEditorAtom = atom<HTMLTextAreaElement | null>(null);

export type EditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const translateHighlightData = (
  value: string,
  parserHighlightData: ParserHighlightData,
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
  const controllerParamsResp = useControllerParams();
  const controllerParams = useMemo(() => {
    if (controllerParamsResp.state !== "hasData") {
      return {};
    }

    return controllerParamsResp.data;
  }, [controllerParamsResp]);

  // Get the controller params from the context
  const highlightData = useMemo<HighlightData[]>(() => {
    (window as any).printQQL = () => {
      const seen = new WeakSet();
      const safeReplacer = (_key: string, val: unknown) => {
        if (typeof val === "object" && val !== null) {
          if (seen.has(val)) return "[Circular]";
          seen.add(val);
        }
        return val;
      };
      console.log(JSON.stringify({
        value,
        highlight: data.highlight,
        suggestions: data.suggestions,
        parserError: data.parserError,
      }, safeReplacer, 2));
    };

    void console.log(data)
    const errorHighlightData = (data.parserError ?? []).map(
      (error: QQLParserErrorDetail) => {
        return {
          type: "error",
          metadata: error.message,
          token: {
            startOffset: error.token.startOffset,
            endOffset: error.token.endOffset,
          },
        };
      },
    );

    const processedHighlightData = data.highlight.map((highlight) =>
      translateHighlightData(value, highlight),
    );

    return [...errorHighlightData, ...processedHighlightData];
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
                }) satisfies Suggestion,
            ),
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
                }) satisfies Suggestion,
            ),
          );
          break;
        case "column":
          availableColumns.forEach((column) =>
            results.push({
              type: "variable",
              value: column,
              fromPosition: suggestion.fromPosition,
              toPosition: suggestion.toPosition,
            }),
          );
          break;
        case "function":
          SUPPORTED_AGG_FUNCTIONS.forEach((func) =>
            results.push({
              type: "function",
              value: func,
              fromPosition: suggestion.fromPosition,
              toPosition: suggestion.toPosition,
            }),
          );
          break;
        case "booleanFunction":
          SUPPORTED_BOOLEAN_FUNCTIONS.forEach((func) =>
            results.push({
              type: "function",
              value: func,
              fromPosition: suggestion.fromPosition,
              toPosition: suggestion.toPosition,
            }),
          );
          break;
        case "controllerParam":
          Object.keys(controllerParams).forEach((param) =>
            results.push({
              type: "param",
              value: param,
              fromPosition: suggestion.fromPosition,
              toPosition: suggestion.toPosition,
            }),
          );
          break;
        case "paramValue": {
          const paramValues = controllerParams[suggestion.key];
          if (!paramValues) {
            continue;
          }

          paramValues.forEach((value) =>
            results.push({
              type: "variable",
              value: value,
              fromPosition: suggestion.fromPosition,
              toPosition: suggestion.toPosition,
            }),
          );
          break;
        }
      }
    }
    return results;
  }, [data]);

  const popperRoot = getPopperRoot();

  return (
    <EditorErrorBoundary>
      <EditorComponent
        popperRoot={popperRoot}
        ref={setQueryEditor}
        value={value}
        onChange={onChange}
        highlightData={highlightData}
        suggestions={suggestions}
      />
    </EditorErrorBoundary>
  );
};
