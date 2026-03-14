import { Card } from "@chakra-ui/react";
import { token } from "~components/ui/system";
import { scaleLinear } from "d3-scale";
import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { useViewDataQuery } from "~core/api";
import { actualEndTimeAtom, actualStartTimeAtom } from "~core/store/dateState";
import { formatDataTimeShort } from "@cruncher/adapter-utils/formatters";
import { useTimezone } from "~core/store/appStore";
import { toJsonObject } from "@cruncher/adapter-utils/logTypes";
import { Bucket } from "@cruncher/server-shared";

const LIMIT = 10000;

export type ViewChartProps = {};
export const ViewChart = (_props: ViewChartProps) => {
  // TODO: use fixed values instead of the actual atoms
  const selectedStartTime = useAtomValue(actualStartTimeAtom);
  const selectedEndTime = useAtomValue(actualEndTimeAtom);
  const timezone = useTimezone();

  const { data: view } = useViewDataQuery();

  const scale = useMemo(() => {
    if (!selectedStartTime || !selectedEndTime) {
      return;
    }

    return scaleLinear().domain([
      selectedStartTime.getTime(),
      selectedEndTime.getTime(),
    ]);
  }, [selectedStartTime, selectedEndTime]);

  const isTooBig = (view?.data.length ?? 0) > LIMIT;

  const dataPoints = useMemo(() => {
    if (!view || isTooBig) {
      return undefined;
    }

    return view.data.map((dataPoint) => toJsonObject(dataPoint));
  }, [view, isTooBig]);

  const [selectedSerieses, setSelectedSerieses] = useState<string[]>([]);

  const filteredAxises = useMemo(() => {
    if (!view) {
      return [];
    }

    if (selectedSerieses.length === 0) {
      return view.YAxis;
    }

    return view.YAxis.filter((yAxis) => {
      return selectedSerieses.includes(yAxis.name);
    });
  }, [view, selectedSerieses]);

  const toggleBucket = (bucket: string) => {
    if (selectedSerieses.includes(bucket)) {
      setSelectedSerieses(selectedSerieses.filter((item) => item !== bucket));
    } else {
      setSelectedSerieses([...selectedSerieses, bucket]);
    }
  };

  if (isTooBig) {
    return (
      <Card.Root
        bg="bg.muted"
        borderWidth="1px"
        borderColor="border"
        color="fg"
        fontSize="0.75rem"
      >
        <Card.Body padding={2}>
          <p className="intro">
            Too many data points to display ({"> "}
            {LIMIT}). Please filter the data or reduce the data by lowering the
            groups count.
          </p>
        </Card.Body>
      </Card.Root>
    );
  }

  if (!scale || !dataPoints || !view) {
    return null;
  }

  return (
    <div
      className="highlight-bar-charts"
      style={{
        userSelect: "none",
        width: "100%",
        background: token("colors.bg"),
      }}
    >
      <ResponsiveContainer width="100%" minHeight={300}>
        <LineChart width={100} height={300} data={dataPoints}>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke={token("colors.border")}
            vertical={false}
          />
          <XAxis
            scale={scale}
            dataKey={view.XAxis}
            ticks={scale.ticks()}
            domain={scale.domain()}
            tickFormatter={(value) => formatDataTimeShort(value, timezone)}
            type="number"
            tick={{ fill: token("colors.fg.muted"), fontSize: 11 }}
            axisLine={{ stroke: token("colors.border") }}
            tickLine={{ stroke: token("colors.border") }}
          />
          <YAxis
            yAxisId="1"
            tick={{ fill: token("colors.fg.muted"), fontSize: 11 }}
            axisLine={{ stroke: token("colors.border") }}
            tickLine={{ stroke: token("colors.border") }}
            width={40}
          />
          <Tooltip
            content={
              <CustomTooltip
                selectedAxises={selectedSerieses}
                timezone={timezone}
              />
            }
          />
          {view.YAxis.map((yAxis) => {
            const isSelected =
              selectedSerieses.length === 0 ||
              selectedSerieses.includes(yAxis.name);

            return (
              <Line
                yAxisId="1"
                type="linear"
                strokeWidth={2}
                key={yAxis.name}
                dataKey={yAxis.name}
                stroke={yAxis.color}
                activeDot={{ r: 8, opacity: isSelected ? 1 : 0.02 }}
                opacity={isSelected ? 1 : 0.02}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      <Legend
        allAxises={view.YAxis}
        selectedAxises={filteredAxises}
        onClick={toggleBucket}
      />
    </div>
  );
};

const CustomTooltip = ({
  active,
  payload,
  label,
  selectedAxises,
  timezone,
}: TooltipProps<number, string> & {
  payload?: Array<{ dataKey?: string | number; value?: number }>;
  label?: number;
  selectedAxises: string[];
  timezone: import("@cruncher/adapter-utils/formatters").Timezone;
}) => {
  const sortedPayload = useMemo(() => {
    if (!payload) {
      return [];
    }

    return payload.slice().sort((a, b) => {
      return (
        -selectedAxises.indexOf(a.dataKey as string) +
        selectedAxises.indexOf(b.dataKey as string)
      );
    });
  }, [payload, selectedAxises]);

  if (active && payload && payload.length) {
    return (
      <Card.Root
        bg="bg.muted"
        borderWidth="1px"
        borderColor="border"
        color="fg"
        fontSize="0.75rem"
      >
        <Card.Body padding={2}>
          {label !== undefined && (
            <p className="label">{formatDataTimeShort(label, timezone)}</p>
          )}
          {sortedPayload.slice(0, 10).map((item) => {
            const isSelected =
              selectedAxises.length === 0 ||
              selectedAxises.includes(item.dataKey as string);
            return (
              <p
                key={item.dataKey}
                className="intro"
                style={{ opacity: isSelected ? 1 : 0.5 }}
              >
                {item.dataKey} : {item.value}
              </p>
            );
          })}
        </Card.Body>
      </Card.Root>
    );
  }

  return null;
};

const Legend = ({
  allAxises,
  selectedAxises,
  onClick,
}: {
  allAxises: Bucket[];
  selectedAxises: Bucket[];
  onClick: (bucket: string) => void;
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        justifyContent: "center",
      }}
    >
      {allAxises.map((yAxis) => {
        const isSelected =
          selectedAxises.length === 0 || selectedAxises.includes(yAxis);

        return (
          <div
            key={yAxis.name}
            onClick={() => onClick(yAxis.name)}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              justifyContent: "center",
              opacity: isSelected ? 1 : 0.5,
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                backgroundColor: yAxis.color,
              }}
            ></span>
            <span>{yAxis.name}</span>
          </div>
        );
      })}
    </div>
  );
};
