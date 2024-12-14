import styled from "@emotion/styled";
import type React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ProgressBar, ProgressRoot } from "~components/ui/progress";

import { IconButton, Stack } from "@chakra-ui/react";
import { css } from "@emotion/react";
import { Mutex } from "async-mutex";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useMemo, useRef, useState } from "react";
import { LuSearch, LuSearchCode, LuSearchX } from "react-icons/lu";
import { Shortcut } from "~components/ui/shortcut";
import { Tooltip } from "~components/ui/tooltip";
import { parse } from "~core/qql";
import { QueryProvider } from "./common/interface";
import { asDateField, ProcessedData } from "./common/logTypes";
import { DateSelector, isDateSelectorOpen } from "./DateSelector";
import {
  actualEndTimeAtom,
  actualStartTimeAtom,
  compareFullDates,
  endFullDateAtom,
  FullDate,
  isTimeNow,
  startFullDateAtom,
} from "./store/dateState";
import { Editor } from "./Editor";
import { headerShortcuts } from "./keymaps";
import {
  dataViewModelAtom,
  originalDataAtom,
  searchQueryAtom,
} from "./store/queryState";
import { Timer } from "./Timer";
import { store } from "./store/store";
import { tree } from "./indexes/timeIndex";
import { getPipelineItems } from "./pipelineEngine/root";

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
  search: string[];
  start: FullDate;
  end: FullDate;
};

const compareQueries = (query1: string[], query2: string[]) => {
  if (query1.length !== query2.length) {
    return false;
  }

  for (let i = 0; i < query1.length; i++) {
    if (query1[i] !== query2[i]) {
      return false;
    }
  }

  return true;
};

const compareExecutions = (
  exec1: QueryExecutionHistory,
  exec2: QueryExecutionHistory | undefined
) => {
  if (exec2 === undefined) {
    return false;
  }

  if (!compareQueries(exec1.search, exec2.search)) {
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

  const [lastExecutedQuery, setLastExecutedQuery] =
    useState<QueryExecutionHistory>();

  const [searchValue, setSearchValue] = useAtom(searchQueryAtom);
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
      };

      if (!isForced && compareExecutions(executionQuery, lastExecutedQuery)) {
        console.log("using cached data");
        dataForPipelines = originalData;
        const finalData = getPipelineItems(
          dataForPipelines,
          parsedTree.pipeline
        );
        console.log(finalData);
        setDataViewModel(finalData);
      } else {
        try {
          tree.clear();
          await controller.query(parsedTree.search, {
            fromTime: fromTime,
            toTime: toTime,
            cancelToken: cancelToken,
            limit: 100000,
            onBatchDone: (data) => {
              dataForPipelines = dataForPipelines.concat(data); // append data
              data.forEach((data) => {
                const timestamp = asDateField(data.object._time).value;
                const toAppendTo = tree.get(timestamp) ?? [];
                toAppendTo.push(data);
                tree.set(timestamp, toAppendTo);
              });

              const finalData = getPipelineItems(
                dataForPipelines,
                parsedTree.pipeline
              );
              console.log(finalData);
              setDataViewModel(finalData);
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
          onTerminateSearch={() => abortController.current.abort("User aborted")}
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
              content={
                <span>
                  Terminate Search
                </span>
              }
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
      </Stack>
    </ButtonsHolder>
  );
};

export default Header;
