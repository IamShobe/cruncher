import { scaleLinear } from "d3-scale";
import { useMemo, useRef, useState } from "react";

import { Card } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { formatDataTimeShort } from "./common/formatters";
import { actualEndTimeAtom, actualStartTimeAtom } from "./store/dateState";
import { eventsAtom } from "./store/queryState";
import { rangeInViewAtom } from "./events/state";
import { scrollToIndexAtom } from "./events/DataLog";
import { tree } from "./indexes/timeIndex";

export const TimeChart = () => {
  const events = useAtomValue(eventsAtom);
  const objects = events.data;

  const scrollToIndex = useAtomValue(scrollToIndexAtom);

  const ref = useRef(null);

  const [refAreaLeft, setRefAreaLeft] = useState<number>();
  const [refAreaRight, setRefAreaRight] = useState<number>();

  const rangeSelected = () => {
    setRefAreaLeft(undefined);
    setRefAreaRight(undefined);
  };

  const selectedStartTime = useAtomValue(actualStartTimeAtom);
  const selectedEndTime = useAtomValue(actualEndTimeAtom);
  const scale = useMemo(() => {
    if (!selectedStartTime || !selectedEndTime) {
      return;
    }

    return scaleLinear().domain([
      selectedStartTime.getTime(),
      selectedEndTime.getTime(),
    ]);
  }, [selectedStartTime, selectedEndTime]);

  const rangeInView = useAtomValue(rangeInViewAtom);

  const dataBuckets = useMemo(() => {
    if (!scale) {
      return;
    }

    const buckets: Record<number, number> = {};
    const ticks = scale.ticks(100);

    objects.forEach((object) => {
      // round timestamp to the nearest tick
      const timestamp = ticks.reduce((prev, curr) =>
        Math.abs(curr - object.timestamp) < Math.abs(prev - object.timestamp)
          ? curr
          : prev
      );
      if (!buckets[timestamp]) {
        buckets[timestamp] = 0;
      }

      buckets[timestamp] += 1;
    });

    return Object.entries(buckets).map(([timestamp, count]) => ({
      timestamp: parseInt(timestamp),
      count,
    }));
  }, [objects, scale]);

  if (!scale) {
    return null;
  }

  return (
    <div
      className="highlight-bar-charts"
      style={{ userSelect: "none", width: "100%" }}
    >
      <ResponsiveContainer width="100%" height={100}>
        <BarChart
          width={800}
          ref={ref}
          height={400}
          data={dataBuckets}
          onMouseDown={(e) => {
            if (e.chartX === undefined) return;

            const timestampClicked = scale.invert(e.chartX);
            setRefAreaLeft(timestampClicked);

            const clicked = tree.nextLowerKey(timestampClicked);
            const index = objects.findIndex((item) => item.timestamp === clicked);
            if (index === -1) return;
            scrollToIndex?.(index);
          }}
          onMouseMove={(e) => {
            if (!refAreaLeft) return;
            if (e.chartX === undefined) return;

            setRefAreaRight(scale.invert(e.chartX));
          }}
          onMouseUp={rangeSelected}
        >
          <CartesianGrid strokeDasharray="10 10" />
          <XAxis
            scale={scale}
            dataKey="timestamp"
            ticks={scale.ticks()}
            domain={scale.domain()}
            tickFormatter={(value) => formatDataTimeShort(value)}
            type="number"
          />
          <YAxis
            domain={[0, "dataMax + 1"]}
            type="number"
            yAxisId="1"
          />
          <Tooltip
            content={
              <CustomTooltip leftArea={refAreaLeft} rightArea={refAreaRight} />
            }
          />
          <Bar
            yAxisId="1"
            dataKey="count"
            stroke="#949494"
            fill="#e0e0e0"
            maxBarSize={10}
            animationDuration={300}
          />
          <ReferenceArea
            yAxisId="1"
            x1={objects[rangeInView.start]?.timestamp}
            x2={objects[rangeInView.end]?.timestamp}
            fill="rgb(255, 255, 255)"
            stroke="#3c55a7"
            strokeWidth={2}
            strokeOpacity={1}
            fillOpacity={0.2}
            />

          {refAreaLeft && refAreaRight ? (
            <ReferenceArea
              yAxisId="1"
              x1={refAreaLeft}
              x2={refAreaRight}
              strokeOpacity={0.3}
            />
          ) : null}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const CustomTooltip = ({
  active,
  payload,
  label,
  leftArea,
  rightArea,
}: TooltipProps<number, string> & {
  leftArea: undefined | number;
  rightArea: undefined | number;
}) => {
  if (active && payload && payload.length) {
    return (
      <Card.Root>
        <Card.Body padding={2}>
          {leftArea && rightArea ? (
            <p className="intro">
              {formatDataTimeShort(leftArea)} to{" "}
              {formatDataTimeShort(rightArea)}
            </p>
          ) : (
            <>
              <p className="label">{formatDataTimeShort(label)}</p>
              {payload.map((item) => (
                <p key={item.dataKey} className="intro">
                  {item.dataKey} : {item.value}
                </p>
              ))}
            </>
          )}
        </Card.Body>
      </Card.Root>
    );
  }

  return null;
};
