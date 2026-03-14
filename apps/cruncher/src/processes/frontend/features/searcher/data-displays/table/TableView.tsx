import { Table } from "@chakra-ui/react";
import { token } from "~components/ui/system";
import { useAtomValue } from "jotai";
import React, { useMemo } from "react";
import { TableComponents, TableVirtuoso } from "react-virtuoso";
import { useTableDataInfiniteQuery } from "~core/api";
import { jobMetadataAtom } from "~core/store/queryState";
import {
  asDisplayString,
  ProcessedData,
} from "@cruncher/adapter-utils/logTypes";
import { highlightText } from "~core/utils/highlight";
import { highlightItemQueryAtom } from "~core/search";

export type TableViewProps = {};

const prepareItem = (dataPoint: ProcessedData, columns: string[]) => {
  const object: string[] = [];
  for (const column of columns) {
    const value = asDisplayString(dataPoint.object[column]);
    object.push(value);
  }
  return object;
};

export const TableView: React.FC<TableViewProps> = (_props: TableViewProps) => {
  const { data, fetchNextPage } = useTableDataInfiniteQuery();

  const dataPoints = useMemo(() => {
    return data ? data.pages.flatMap((d) => d.data) : [];
  }, [data]);

  const jobMetadata = useAtomValue(jobMetadataAtom);
  const columns = jobMetadata?.views.table?.columns ?? [];
  const columnSizes = jobMetadata?.views.table?.columnLengths ?? {};
  const highlightTextQuery = useAtomValue(highlightItemQueryAtom);

  const components = useMemo<TableComponents<ProcessedData>>(() => {
    return {
      Scroller: React.forwardRef((props, ref) => (
        // @ts-expect-error - ref issue..
        <Table.ScrollArea
          ref={ref}
          {...props}
          style={{ ...props.style, background: token("colors.bg") }}
        />
      )),
      Table: (props) => (
        <Table.Root
          {...props}
          style={{
            ...props.style,
            tableLayout: "fixed",
            background: token("colors.bg"),
            color: token("colors.fg"),
          }}
        />
      ),
      TableHead: React.forwardRef((props, ref) => (
        // @ts-expect-error - ref issue..
        <Table.Header
          ref={ref}
          {...props}
          style={{
            ...props.style,
            background: token("colors.bg.subtle"),
          }}
        />
      )),
      TableRow: (props) => (
        <Table.Row
          {...props}
          style={{
            ...props.style,
            borderBottom: `1px solid ${token("colors.border")}`,
          }}
        />
      ),
      TableBody: React.forwardRef((props, ref) => (
        // @ts-expect-error - ref issue..
        <Table.Body ref={ref} {...props} />
      )),
    };
  }, []);

  return (
    <TableVirtuoso
      style={{ flex: 1 }}
      data={dataPoints}
      endReached={() => {
        fetchNextPage();
      }}
      increaseViewportBy={1500}
      components={components}
      fixedHeaderContent={() => (
        <Table.Row
          style={{ borderBottom: `1px solid ${token("colors.border")}` }}
        >
          {columns.map((column, i) => (
            <Table.ColumnHeader
              key={i}
              style={{
                width: `${columnSizes[column] ?? 3}ch`,
                background: token("colors.bg.subtle"),
                color: token("colors.fg.muted"),
                fontWeight: 600,
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                borderBottom: `1px solid ${token("colors.border")}`,
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              {column}
            </Table.ColumnHeader>
          ))}
        </Table.Row>
      )}
      itemContent={(_index, item) => (
        <>
          {prepareItem(item, columns).map((value, i) => (
            <Table.Cell
              key={i}
              style={{
                whiteSpace: "pre-wrap",
                verticalAlign: "top",
                color: token("colors.fg"),
                fontSize: "0.8rem",
                borderBottom: `1px solid ${token("colors.border")}`,
                padding: "6px 12px",
              }}
            >
              {highlightText(value, highlightTextQuery)}
            </Table.Cell>
          ))}
        </>
      )}
    />
  );
};
