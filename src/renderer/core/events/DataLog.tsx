import { css } from "@emotion/react";
import type { Range } from "@tanstack/react-virtual";
import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import DataRow from "./Row";
import { RowDetails } from "./RowDetails";
import { isIndexOpen, rangeInViewAtom } from "./state";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { eventsAtom } from "~core/store/queryState";
import { store } from "~core/store/store";

export const scrollToIndexAtom = atom<(index: number) => void>();

type DataRowProps = {};

const DataLog: React.FC<DataRowProps> = () => {
  const events = useAtomValue(eventsAtom);
  const setScrollToIndex = useSetAtom(scrollToIndexAtom);

  const logs = events.data;

  const parentRef = useRef(null);

  const activeStickyIndexRef = useRef(0);

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
    count: logs.length * 2,
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
    setScrollToIndex(() => (index: number) => rowVirtualizer.scrollToIndex(index * 2));
  }, [rowVirtualizer.scrollToIndex, setScrollToIndex]);

  useEffect(() => {
    if (!rowVirtualizer.range) {
      return;
    }

    const dataIndexStart = Math.floor(rowVirtualizer.range.startIndex / 2);
    const dataIndexEnd = Math.floor(rowVirtualizer.range.endIndex / 2);
    store.set(rangeInViewAtom, {
      start: dataIndexStart,
      end: dataIndexEnd,
    });
  }, [rowVirtualizer.range]);

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
          const index = Math.floor(virtualItem.index / 2);
          const isDetails = virtualItem.index % 2 === 1;
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

