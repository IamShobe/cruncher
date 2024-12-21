import styled from "@emotion/styled";
import merge from "merge-k-sorted-arrays";
import type React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ProgressBar, ProgressRoot } from "~components/ui/progress";

import { Card, IconButton, MenuSeparator, Stack } from "@chakra-ui/react";
import { css } from "@emotion/react";
import { Mutex } from "async-mutex";
import { generateCsv, mkConfig } from "export-to-csv";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import { CiExport } from "react-icons/ci";
import {
  LuClipboardCopy,
  LuDownload,
  LuSearch,
  LuSearchCode,
  LuSearchX,
} from "react-icons/lu";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "~components/ui/menu";
import { Shortcut } from "~components/ui/shortcut";
import { Tooltip } from "~components/ui/tooltip";
import { parse, PipelineItem, QQLLexingError, QQLParserError } from "~core/qql";
import { QueryProvider } from "./common/interface";
import {
  asDateField,
  compareProcessedData,
  ProcessedData,
} from "./common/logTypes";
import { DateSelector, isDateSelectorOpen } from "./DateSelector";
import { Editor } from "./Editor";
import { tree } from "./indexes/timeIndex";
import { headerShortcuts } from "./keymaps";
import { getPipelineItems } from "./pipelineEngine/root";
import {
  actualEndTimeAtom,
  actualStartTimeAtom,
  compareFullDates,
  endFullDateAtom,
  FullDate,
  isTimeNow,
  startFullDateAtom,
} from "./store/dateState";
import {
  availableControllerParamsAtom,
  dataViewModelAtom,
  originalDataAtom,
  searchQueryAtom,
} from "./store/queryState";
import { store } from "./store/store";
import { Timer } from "./Timer";
import toast from "react-hot-toast";
import { CloseButton } from "~components/ui/close-button";
import equal from "fast-deep-equal";
import { ControllerIndexParam, Search } from "./qql/grammar";
import { WorkerMessageRequest, WorkerMessageResponse } from "./sw/types";
import WebWorker from "./sw/pipelineWorker?worker&inline";

const StyledHeader = styled.form`
  display: flex;
  gap: 0.4rem;
  flex-direction: row;
  padding: 0.3rem;
`;

const QueryContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
`;

const ButtonsHolder = styled.div`
  display: flex;
`;

const LoaderHolder = styled.div`
  display: flex;
  flex-direction: column;
  /* padding: 0 0.9rem; */
  height: 5px;
`;

type HeaderProps = {
  controller: QueryProvider;
};

type FormValues = {
  searchTerm: string;
  fromTime: FullDate | undefined;
  toTime: FullDate | undefined;
};

type QueryExecutionHistory = {
  params: ControllerIndexParam[];
  search: Search;
  start: FullDate;
  end: FullDate;
};


const compareExecutions = (
  exec1: QueryExecutionHistory,
  exec2: QueryExecutionHistory | undefined
) => {
  if (exec2 === undefined) {
    return false;
  }

  if (!equal(exec1.params, exec2.params)) {
    return false;
  }

  if (!equal(exec1.search, exec2.search)) {
    return false;
  }

  if (compareFullDates(exec1.start, exec2.start) !== 0) {
    return false;
  }

  if (compareFullDates(exec1.end, exec2.end) !== 0) {
    return false;
  }

  return true;
};

const Header: React.FC<HeaderProps> = ({ controller }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useAtom(originalDataAtom);
  const setDataViewModel = useSetAtom(dataViewModelAtom);
  const { runPipeline } = useWebWorker();

  const [lastExecutedQuery, setLastExecutedQuery] =
    useState<QueryExecutionHistory>();

  const [searchValue, setSearchValue] = useAtom(searchQueryAtom);
  const setAvailableControllerParams = useSetAtom(availableControllerParamsAtom);
  const selectedStartTime = useAtomValue(startFullDateAtom);
  const selectedEndTime = useAtomValue(endFullDateAtom);

  const setActualStartTime = useSetAtom(actualStartTimeAtom);
  const setActualEndTime = useSetAtom(actualEndTimeAtom);

  const abortController = useRef(new AbortController());
  const submitMutex = useRef(new Mutex());

  // query execution props
  const [isQuerySuccess, setIsQuerySuccess] = useState(true);
  const [queryStartTime, setQueryStartTime] = useState<Date>();
  const [queryEndTime, setQueryEndTime] = useState<Date>();

  const { handleSubmit } = useForm<FormValues>({
    values: {
      searchTerm: searchValue,
      fromTime: selectedStartTime,
      toTime: selectedEndTime,
    },
  });

  const startProcessingData = async (
    data: ProcessedData[],
    pipeline: PipelineItem[],
    startTime: Date,
    endTime: Date
  ) => {
    try {
      const finalData = await runPipeline(data, pipeline, startTime, endTime);
      // const finalData = getPipelineItems(data, pipeline, startTime, endTime);
      setDataViewModel(finalData);
    } catch (error) {
      // check error is of type Error
      if (!(error instanceof Error)) {
        throw error;
      }

      notifyError("Error processing pipeline", error);
    }
  };

  useEffect(() => {
    controller.getControllerParams().then((value) => {
      setAvailableControllerParams(value);
    });
  }, []);

  const doSubmit = async (values: FormValues, isForced: boolean) => {
    if (values.fromTime === undefined) {
      // TODO: return error
      return;
    }

    if (values.toTime === undefined) {
      // TODO: return error
      return;
    }

    const fromTime = isTimeNow(values.fromTime) ? new Date() : values.fromTime;
    const toTime = isTimeNow(values.toTime) ? new Date() : values.toTime;

    if (fromTime.getTime() > toTime.getTime()) {
      // TODO: return error
      return;
    }

    setActualStartTime(fromTime);
    setActualEndTime(toTime);

    try {
      const parsedTree = parse(values.searchTerm);
      let dataForPipelines: ProcessedData[] = [];
      const cancelToken = abortController.current.signal;
      try {
        setIsLoading(true);
        setQueryStartTime(new Date());
        setQueryEndTime(undefined);

        const executionQuery = {
          search: parsedTree.search,
          start: fromTime,
          end: toTime,
          params: parsedTree.controllerParams,
        };

        if (!isForced && compareExecutions(executionQuery, lastExecutedQuery)) {
          console.log("using cached data");
          dataForPipelines = originalData;
          await startProcessingData(dataForPipelines, parsedTree.pipeline, fromTime, toTime);
        } else {
          try {
            tree.clear();
            await controller.query(parsedTree.controllerParams, parsedTree.search, {
              fromTime: fromTime,
              toTime: toTime,
              cancelToken: cancelToken,
              limit: 100000,
              onBatchDone: (data) => {
                dataForPipelines = merge<ProcessedData>(
                  [dataForPipelines, data],
                  compareProcessedData
                );
                data.forEach((data) => {
                  const timestamp = asDateField(data.object._time).value;
                  const toAppendTo = tree.get(timestamp) ?? [];
                  toAppendTo.push(data);
                  tree.set(timestamp, toAppendTo);
                });

                setOriginalData(dataForPipelines);

                startProcessingData(dataForPipelines, parsedTree.pipeline, fromTime, toTime);
              },
            });

            setLastExecutedQuery(executionQuery);
            setOriginalData(dataForPipelines);
            setIsQuerySuccess(true);
          } catch (error) {
            setIsQuerySuccess(false);
            console.log(error);
            if (cancelToken.aborted) {
              return; // don't continue if the request was aborted
            }

            console.error("Error executing query: ", error);
            throw error;
          }
        }
      } finally {
        setIsLoading(false);
        setQueryEndTime(new Date());
      }
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      console.error("Error parsing query: ", error);
      notifyError("Error parsing query", error);
    }
  };

  const onSubmit =
    (isForced: boolean): SubmitHandler<FormValues> =>
    async (values) => {
      if (isLoading) {
        abortController.current.abort("New query submitted");
      }

      // reset abort controller
      abortController.current = new AbortController();

      await submitMutex.current.runExclusive(async () => {
        await doSubmit(values, isForced);
      });
    };

  const onHeaderKeyDown = (e: React.KeyboardEvent) => {
    if (headerShortcuts.isPressed(e, "search")) {
      e.preventDefault();
      store.set(isDateSelectorOpen, false);
      handleSubmit(onSubmit(true))();
    } else if (headerShortcuts.isPressed(e, "re-evaluate")) {
      e.preventDefault();
      store.set(isDateSelectorOpen, false);
      handleSubmit(onSubmit(false))();
    }
  };

  const loaderValue = isLoading ? null : 100;
  const loaderColor = useMemo(() => {
    if (isLoading) {
      return "gray" as const;
    }

    if (isQuerySuccess) {
      return "green" as const;
    }

    return "red" as const;
  }, [isLoading, isQuerySuccess]);

  return (
    <>
      <LoaderHolder>
        <ProgressRoot
          value={loaderValue}
          variant="subtle"
          size="xs"
          colorPalette={loaderColor}
        >
          <ProgressBar />
        </ProgressRoot>
      </LoaderHolder>
      <StyledHeader
        onSubmit={handleSubmit(onSubmit(false))}
        onKeyDown={onHeaderKeyDown}
      >
        <QueryContainer>
          <div
            css={css`
              flex: 1;
            `}
          >
            <Editor value={searchValue} onChange={setSearchValue} />
          </div>
          <Timer
            startTime={queryStartTime}
            endTime={queryEndTime}
            isLoading={isLoading}
          />
        </QueryContainer>
        <SearchBarButtons
          isLoading={isLoading}
          onForceSubmit={() => handleSubmit(onSubmit(true))()}
          onTerminateSearch={() =>
            abortController.current.abort("User aborted")
          }
        />
      </StyledHeader>
    </>
  );
};

type SearchBarButtonsProps = {
  isLoading: boolean;
  onForceSubmit: () => void;
  onTerminateSearch: () => void;
};

const SearchBarButtons: React.FC<SearchBarButtonsProps> = ({
  isLoading,
  onForceSubmit,
  onTerminateSearch,
}) => {
  return (
    <ButtonsHolder>
      <Stack gap={3}>
        <DateSelector />
        <Stack gap={3} direction="row">
          <Tooltip
            content={
              <span>
                Re-evaluate{" "}
                <Shortcut keys={headerShortcuts.getAlias("re-evaluate")} />
              </span>
            }
            showArrow
            positioning={{
              placement: "bottom",
            }}
          >
            <IconButton
              aria-label="Re-evalutate"
              type="submit"
              disabled={isLoading}
            >
              <LuSearchCode />
            </IconButton>
          </Tooltip>
          {isLoading ? (
            <Tooltip
              content={<span>Terminate Search</span>}
              showArrow
              positioning={{
                placement: "bottom",
              }}
            >
              <IconButton
                aria-label="Terminate database"
                onClick={() => onTerminateSearch()}
              >
                <LuSearchX />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip
              content={
                <span>
                  Search <Shortcut keys={headerShortcuts.getAlias("search")} />
                </span>
              }
              showArrow
              positioning={{
                placement: "bottom",
              }}
            >
              <IconButton
                aria-label="Search database"
                onClick={() => onForceSubmit()}
              >
                <LuSearch />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        <MiniButtons />
      </Stack>
    </ButtonsHolder>
  );
};

const csvConfig = mkConfig({ useKeysAsHeaders: true });

const downloadFile = (filename: string, data: string, mimeType: string) => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;

  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const MiniButtons = () => {
  const {table: tableView} = useAtomValue(dataViewModelAtom);

  const isDisabled = tableView === undefined;

  const dataAsArray = () => {
    if (tableView === undefined) {
      throw new Error("Table view is undefined");
    }

    return tableView.dataPoints.map((row) => {
      const result: Record<string, any> = {};
      for (const key in row.object) {
        result[key] = row.object[key]?.value;
      }

      return result;
    });
  };

  const getCSVValue = () => {
    const data = dataAsArray();

    return generateCsv(csvConfig)(data) as unknown as string;
  };

  const downloadCsv = () => {
    const csvValue = getCSVValue();
    const filename = `data-export-${new Date().toISOString()}.csv`;
    downloadFile(filename, csvValue, "text/csv");
  };

  const copyCsv = () => {
    const csvValue = getCSVValue();
    navigator.clipboard.writeText(csvValue);
  };

  const getJson = () => {
    const data = dataAsArray();

    return JSON.stringify(data);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(getJson());
  };

  const downloadJson = () => {
    const filename = `data-export-${new Date().toISOString()}.json`;
    downloadFile(filename, getJson(), "application/json");
  };

  return (
    <Stack gap={3} direction="row">
      <MenuRoot lazyMount unmountOnExit>
        <MenuTrigger asChild disabled={isDisabled}>
          <IconButton aria-label="Export" size="2xs" variant="surface">
            <CiExport />
          </IconButton>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="json-copy" cursor="pointer" onClick={copyJson}>
            <LuClipboardCopy /> Copy JSON
          </MenuItem>
          <MenuItem value="csv-copy" cursor="pointer" onClick={copyCsv}>
            <LuClipboardCopy /> Copy CSV
          </MenuItem>
          <MenuSeparator />
          <MenuItem
            value="json-download"
            cursor="pointer"
            onClick={downloadJson}
          >
            <LuDownload /> Download JSON
          </MenuItem>
          <MenuItem value="csv-download" cursor="pointer" onClick={downloadCsv}>
            <LuDownload /> Download CSV
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </Stack>
  );
};

const notifyError = (message: string, error: Error) => {
  console.error(message, error);
  toast.error(
    (t) => {
      let subMessage = error.message;
      if (error instanceof QQLLexingError) {
        const errors: string[] = [];
        error.errors.map((e) => {
          errors.push(`${e.line}:${e.column} - ${e.message}`);
        });

        subMessage = errors.join("\n");
      } else if (error instanceof QQLParserError) {
        const errors: string[] = [];
        error.errors.map((e) => {
          errors.push(`${e.message}`);
        });

        subMessage = errors.join("\n");
      }

      return (
        <Card.Root
          pointerEvents={"all"}
          zIndex={1000}
          padding="3"
          backgroundColor={"red.600"}
        >
          <Card.Header padding={0}>
            <Stack direction="row" alignItems={"center"}>
              <Card.Title>{message}</Card.Title>
              <CloseButton
                marginLeft="auto"
                size="2xs"
                onClick={() => toast.dismiss(t.id)}
              />
            </Stack>
          </Card.Header>
          <Card.Body padding={0}>{subMessage}</Card.Body>
        </Card.Root>
      );
    },
    {
      position: "bottom-right",
      duration: 10000,
    }
  );
};


type Subscribers = Record<string, Function>;

const worker = new WebWorker();
const useWebWorker = () => {
  const subscribers = useRef<Subscribers>({});

  useEffect(() => {
    worker.onmessage = (event: MessageEvent<WorkerMessageResponse>) => {
      // console.log("received message", event.data);
      // const rawMessage = new TextDecoder().decode(event.data);
      // const message = JSON.parse(rawMessage);
      const message = event.data;
      console.log("processed message", message);

      if (message.id && subscribers.current[message.id]) {
        subscribers.current[message.id](message);
      }
    };
  }, []);

  const awaitResponse = (id: string) => {
    return new Promise<WorkerMessageResponse>((resolve) => {
      subscribers.current[id] = resolve;
    });
  };

  const runPipeline = async (
    data: ProcessedData[],
    pipeline: PipelineItem[],
    dateStart: Date,
    dateEnd: Date,
  ) => {
    const id = Math.random().toString(36).substring(7);
    const transferable = {
      type: "runPipeline",
      id,
      data: {
        data,
        pipeline,
        timeStart: dateStart.getTime(),
        timeEnd: dateEnd.getTime(),
      },
    } satisfies WorkerMessageRequest;

    worker.postMessage(transferable);

    const response = await awaitResponse(id);
    return response.data;
  };

  return { runPipeline };
};

export default Header;
