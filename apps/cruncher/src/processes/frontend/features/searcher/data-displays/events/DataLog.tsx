import { css } from "@emotion/react";
import { token } from "~components/ui/system";
import { useVirtualizer } from "@tanstack/react-virtual";
import { atom, useAtomValue, useSetAtom } from "jotai";
import type React from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { useLogsInfiniteQuery } from "~core/api";
import { asDateField } from "@cruncher/adapter-utils/logTypes";
import DataRow from "./Row";
import { RowDetails } from "./RowDetails";
import { rangeInViewAtom } from "./state";
import { isLiveFetchingAtom, isLiveModeAtom } from "~core/store/liveState";

export const scrollToIndexAtom = atom<(index: number) => void>();

type DataRowProps = {};

const DataLog: React.FC<DataRowProps> = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useLogsInfiniteQuery();

  const setScrollToIndex = useSetAtom(scrollToIndexAtom);
  const isLiveMode = useAtomValue(isLiveModeAtom);
  const isLiveFetching = useAtomValue(isLiveFetchingAtom);

  const logs = useMemo(() => data?.pages.flatMap((d) => d.data) ?? [], [data]);
  const total = data ? data.pages[0].total : 0;

  const parentRef = useRef<HTMLElement>(null);

  // Step 1 snapshot: taken when live fetching begins, before network request.
  const liveAnchorRef = useRef<{
    virtualIndex: number;
    offsetInItem: number;
    totalBefore: number;
  } | null>(null);

  // Active correction target: set after Step 2, cleared when position stabilises.
  // The correction effect re-runs every render until TanStack Virtual's
  // ResizeObserver measurement cycle is done and the position stops changing.
  const anchorTargetRef = useRef<{
    virtualIndex: number;
    offsetInItem: number;
  } | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: total,
    getScrollElement: useCallback(
      () => parentRef.current as HTMLElement | null,
      [parentRef],
    ),
    estimateSize: useCallback(() => 35, []),
    overscan: 100,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= logs.length - 1 &&
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
    virtualItems,
  ]);

  useEffect(() => {
    setScrollToIndex(
      () => (index: number) => rowVirtualizer.scrollToIndex(index),
    );
  }, [rowVirtualizer, rowVirtualizer.scrollToIndex, setScrollToIndex]);

  // Step 1 — fires when live fetching starts, before the network request.
  // Capture the exact virtual index at the top of the viewport and how many
  // pixels into that item the viewport starts.
  useLayoutEffect(() => {
    if (!isLiveFetching) return;

    const el = parentRef.current;
    // At the very top → user wants to see new items, no anchoring needed.
    if (!el || el.scrollTop < 10) {
      liveAnchorRef.current = null;
      return;
    }

    const range = rowVirtualizer.range;
    if (!range) return;

    const startVIdx = range.startIndex;
    const topItem = rowVirtualizer
      .getVirtualItems()
      .find((v) => v.index === startVIdx);
    const offsetInItem = Math.max(0, el.scrollTop - (topItem?.start ?? 0));

    liveAnchorRef.current = {
      virtualIndex: startVIdx,
      offsetInItem,
      totalBefore: total,
    };
  }, [isLiveFetching]); // eslint-disable-line react-hooks/exhaustive-deps

  // Step 2 — fires after React Query delivers new data and total increases.
  // Scroll to the same virtual item at its new index, preserving the
  // sub-item pixel offset (important for open detail panels).
  useLayoutEffect(() => {
    const anchor = liveAnchorRef.current;
    if (!anchor || !isLiveMode) return;

    const delta = total - anchor.totalBefore; // number of new log entries
    if (delta <= 0) {
      liveAnchorRef.current = null;
      return;
    }

    const newVirtualIndex = anchor.virtualIndex + delta;

    // scrollToIndex puts the item at the top of the viewport (align: 'start'),
    // then we add the partial pixel offset back.
    rowVirtualizer.scrollToIndex(newVirtualIndex, { align: "start" });
    const el = parentRef.current;
    if (el) el.scrollTop += anchor.offsetInItem;

    // Arm the post-measurement corrector. ResizeObserver will measure the new
    // rows shortly after this paint; their actual heights may differ from the
    // 35px estimate, shifting our item's position. The corrector re-aligns.
    anchorTargetRef.current = {
      virtualIndex: newVirtualIndex,
      offsetInItem: anchor.offsetInItem,
    };
    liveAnchorRef.current = null;
  }, [total, isLiveMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Post-measurement correction — no deps so it runs after every render.
  // While anchorTargetRef is set it checks if the target item has been
  // repositioned (by ResizeObserver measuring new rows above it) and nudges
  // scrollTop to match. Clears itself once the position is stable.
  useLayoutEffect(() => {
    const target = anchorTargetRef.current;
    if (!target) return;

    const el = parentRef.current;
    if (!el) return;

    const anchorItem = rowVirtualizer
      .getVirtualItems()
      .find((v) => v.index === target.virtualIndex);

    if (!anchorItem) {
      // Item scrolled out of rendered range — nothing to correct.
      anchorTargetRef.current = null;
      return;
    }

    const expectedScrollTop = anchorItem.start + target.offsetInItem;
    if (Math.abs(el.scrollTop - expectedScrollTop) < 1) {
      // Position is stable — measurements have settled, stop correcting.
      anchorTargetRef.current = null;
      return;
    }

    el.scrollTop = expectedScrollTop;
    // Leave anchorTargetRef set so we run again after the next render
    // (triggered by the scroll event above) to verify stability.
  });

  const setRangeInView = useSetAtom(rangeInViewAtom);

  useEffect(() => {
    if (!rowVirtualizer.range) {
      return;
    }

    const dataIndexStart = rowVirtualizer.range.startIndex;
    const dataIndexEnd = rowVirtualizer.range.endIndex;

    const startDate = asDateField(logs[dataIndexStart]?.object._time).value;
    const endDate = asDateField(logs[dataIndexEnd]?.object._time).value;

    setRangeInView({
      start: startDate,
      end: endDate,
    });
  }, [rowVirtualizer, rowVirtualizer.range, setRangeInView, logs]);

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
          const isLoaderRow = virtualItem.index > logs.length - 1;
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

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: "absolute",
                top: `${virtualItem.start}px`,
                left: 0,
                width: "100%",
              }}
            >
              <div
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  backgroundColor: token("colors.bg"),
                }}
              >
                <DataRow row={logs[virtualItem.index]} />
              </div>
              <RowDetails row={logs[virtualItem.index]} />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DataLog;
