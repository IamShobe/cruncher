import { css } from "@emotion/react";
import type { Range } from "@tanstack/react-virtual";
import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual";
import { atom, useSetAtom } from "jotai";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { useLogsInfiniteQuery } from "~core/api";
import { asDateField } from "~lib/adapters/logTypes";
import DataRow from "./Row";
import { RowDetails } from "./RowDetails";
import { rangeInViewAtom, useIsIndexOpen } from "./state";

export const scrollToIndexAtom = atom<(index: number) => void>();

type DataRowProps = {};

const DataLog: React.FC<DataRowProps> = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLogsInfiniteQuery();

  const setScrollToIndex = useSetAtom(scrollToIndexAtom);

  // const logs = events.data;
  const logs = data ? data.pages.flatMap((d) => d.data) : [];
  const total = data ? data.pages[0].total : 0;

  const parentRef = useRef(null);

  const activeStickyIndexRef = useRef(0);
  const isIndexOpen = useIsIndexOpen();

  const isSticky = (index: number) => {
    const dataIndex = Math.floor(index / 2);
    const isOpen = isIndexOpen(dataIndex);
    return activeStickyIndexRef.current === index && isOpen;
  };

  const isActiveSticky = (index: number) => {
    const dataIndex = Math.floor(index / 2);
    const isOpen = isIndexOpen(dataIndex);
    return activeStickyIndexRef.current === index && isOpen;
  };

  const rowVirtualizer = useVirtualizer({
    count: total * 2,
    getScrollElement: useCallback(() => parentRef.current, [parentRef]),
    estimateSize: useCallback(() => 35, []),
    overscan: 100,
    rangeExtractor: useCallback((range: Range) => {
      activeStickyIndexRef.current = range.startIndex;
      if (range.startIndex % 2 === 1) {
        activeStickyIndexRef.current -= 1; // get previous sticky index
      }

      const next = new Set([
        activeStickyIndexRef.current,
        ...defaultRangeExtractor(range),
      ]);

      return [...next].sort((a, b) => a - b);
    }, []),
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= 2 * (logs.length - 1) &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    logs.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  useEffect(() => {
    setScrollToIndex(
      () => (index: number) => rowVirtualizer.scrollToIndex(index * 2)
    );
  }, [rowVirtualizer.scrollToIndex, setScrollToIndex]);

  const setRangeInView = useSetAtom(rangeInViewAtom);

  useEffect(() => {
    if (!rowVirtualizer.range) {
      return;
    }

    const dataIndexStart = Math.floor(rowVirtualizer.range.startIndex / 2);
    const dataIndexEnd = Math.floor(rowVirtualizer.range.endIndex / 2);

    const startDate = asDateField(logs[dataIndexStart]?.object._time).value;
    const endDate = asDateField(logs[dataIndexEnd]?.object._time).value;

    setRangeInView({
      start: startDate,
      end: endDate,
    });
  }, [rowVirtualizer.range, setRangeInView, logs]);

  return (
    <section
      id="data"
      ref={parentRef}
      css={css`
        display: flex;
        font-size: 0.8rem;
        flex: 1;
        overflow: auto;
        transform: translateZ(0);
      `}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const isLoaderRow = virtualItem.index > 2 * logs.length - 1;
          const index = Math.floor(virtualItem.index / 2);
          const isDetails = virtualItem.index % 2 === 1;
          if (isLoaderRow) {
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {hasNextPage ? "Loading more logs..." : "No more logs"}
              </div>
            );
          }

          if (isDetails) {
            return (
              <div
                data-index={virtualItem.index}
                key={virtualItem.key}
                ref={rowVirtualizer.measureElement}
                style={{
                  top: 0,
                  left: 0,
                  width: "100%",
                  position: "absolute",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <RowDetails row={logs[index]} index={index} />
              </div>
            );
          }

          return (
            <div
              data-index={virtualItem.index}
              key={virtualItem.key}
              ref={rowVirtualizer.measureElement}
              style={{
                ...(isSticky(virtualItem.index)
                  ? {
                      zIndex: 2,
                    }
                  : {}),
                ...(isActiveSticky(virtualItem.index)
                  ? {
                      position: "sticky",
                    }
                  : {
                      position: "absolute",
                      transform: `translateY(${virtualItem.start}px)`,
                    }),
                top: 0,
                left: 0,
                width: "100%",
                backgroundColor: "rgb(17, 18, 23)",
              }}
            >
              <DataRow row={logs[index]} index={index} />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DataLog;
