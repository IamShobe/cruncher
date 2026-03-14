import { useState } from "react";

import { Global, css } from "@emotion/react";
import { Card } from "@chakra-ui/react";
import { token } from "~components/ui/system";
import { useAtomValue } from "jotai";
import { isNil } from "lodash-es";
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
import { formatDataTimeShort } from "@cruncher/adapter-utils/formatters";
import { scrollToIndexAtom } from "~features/searcher/data-displays/events/DataLog";
import { rangeInViewAtom } from "~features/searcher/data-displays/events/state";
import { lastRanJobAtom, useInitializedController } from "~core/search";
import { dataBucketsAtom, scaleAtom } from "~core/store/queryState";
import { useTimezone } from "~core/store/appStore";

export const EventsHistogram = () => {
  const scrollToIndex = useAtomValue(scrollToIndexAtom);

  const [refAreaLeft, setRefAreaLeft] = useState<number>();
  const [refAreaRight, setRefAreaRight] = useState<number>();

  const rangeSelected = () => {
    setRefAreaLeft(undefined);
    setRefAreaRight(undefined);
  };

  const rangeInView = useAtomValue(rangeInViewAtom);
  const scale = useAtomValue(scaleAtom);
  const dataBuckets = useAtomValue(dataBucketsAtom);
  const controller = useInitializedController();
  const displayedJob = useAtomValue(lastRanJobAtom);
  const timezone = useTimezone();

  if (!scale) {
    return null;
  }

  return (
    <>
      <Global
        styles={css`
          .highlight-bar-charts *:focus {
            outline: none !important;
          }
        `}
      />
      <div
        className="highlight-bar-charts"
        style={{
          userSelect: "none",
          width: "100%",
          background: token("colors.bg"),
          borderBottom: `1px solid ${token("colors.border")}`,
          outline: "none",
        }}
      >
        <ResponsiveContainer width="100%" height={100}>
          <BarChart
            width={800}
            height={400}
            data={dataBuckets}
            style={{ background: token("colors.bg") }}
            tabIndex={-1}
            onMouseDown={async (e) => {
              if (e.activeLabel === undefined) return;
              if (!displayedJob) return;

              const timestampClicked = Number(e.activeLabel);
              setRefAreaLeft(timestampClicked);

              const clicked = await controller.getClosestDateEvent(
                displayedJob.id,
                timestampClicked,
              );
              if (isNil(clicked?.index)) return;
              scrollToIndex?.(clicked.index);
            }}
            onMouseMove={(e) => {
              if (!refAreaLeft) return;
              if (e.activeLabel === undefined) return;

              setRefAreaRight(Number(e.activeLabel));
            }}
            onMouseUp={rangeSelected}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke={token("colors.border")}
              vertical={false}
            />
            <XAxis
              scale={scale}
              dataKey="timestamp"
              ticks={scale.ticks()}
              domain={scale.domain()}
              tickFormatter={(value) => formatDataTimeShort(value, timezone)}
              type="number"
              tick={{ fill: token("colors.fg.muted"), fontSize: 11 }}
              axisLine={{ stroke: token("colors.border") }}
              tickLine={{ stroke: token("colors.border") }}
            />
            <YAxis
              domain={[0, "dataMax + 1"]}
              type="number"
              yAxisId="1"
              tick={{ fill: token("colors.fg.muted"), fontSize: 11 }}
              axisLine={{ stroke: token("colors.border") }}
              tickLine={{ stroke: token("colors.border") }}
              width={32}
            />
            <Tooltip
              content={
                <CustomTooltip
                  leftArea={refAreaLeft}
                  rightArea={refAreaRight}
                  timezone={timezone}
                />
              }
              cursor={{ fill: token("colors.bg.emphasized"), opacity: 0.5 }}
            />
            <Bar
              yAxisId="1"
              dataKey="count"
              stroke={token("colors.border.emphasized")}
              fill={token("colors.accent")}
              maxBarSize={10}
              animationDuration={300}
            />
            <ReferenceArea
              yAxisId="1"
              x1={rangeInView.start}
              x2={rangeInView.end}
              fill={token("colors.accent")}
              stroke={token("colors.accent.muted")}
              strokeWidth={1}
              strokeOpacity={0.8}
              fillOpacity={0.08}
            />

            {refAreaLeft && refAreaRight ? (
              <ReferenceArea
                yAxisId="1"
                x1={refAreaLeft}
                x2={refAreaRight}
                fill={token("colors.accent")}
                stroke={token("colors.accent.muted")}
                fillOpacity={0.15}
                strokeOpacity={0.4}
              />
            ) : null}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

const CustomTooltip = ({
  active,
  payload,
  label,
  leftArea,
  rightArea,
  timezone,
}: TooltipProps<number, string> & {
  payload?: Array<{ dataKey?: string | number; value?: number }>;
  label?: number;
  leftArea: undefined | number;
  rightArea: undefined | number;
  timezone: import("@cruncher/adapter-utils/formatters").Timezone;
}) => {
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
          {leftArea && rightArea ? (
            <p className="intro">
              {formatDataTimeShort(leftArea, timezone)} to{" "}
              {formatDataTimeShort(rightArea, timezone)}
            </p>
          ) : (
            <>
              {label !== undefined && (
                <p className="label">{formatDataTimeShort(label, timezone)}</p>
              )}
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
