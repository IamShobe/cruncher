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
          {columns.map((column) => (
            <Table.ColumnHeader
              key={column}
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
              key={columns[i]}
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

  // TODO: change to react table when possible...
  //   return (
  //     <div ref={parentRef} className="container" style={{
  //         flex: 1,
  //         overflow: "auto",
  //         minHeight: 0,
  //         position: "relative",
  //     }}>
  //         <Table.Root stickyHeader>
  //           <Table.Header>
  //             {table.getHeaderGroups().map((headerGroup) => (
  //               <Table.Row key={headerGroup.id}>
  //                 {headerGroup.headers.map((header) => {
  //                   return (
  //                     <Table.ColumnHeader
  //                       key={header.id}
  //                       colSpan={header.colSpan}
  //                       style={{ width: header.getSize() }}
  //                     >
  //                       {header.isPlaceholder ? null : (
  //                         <div
  //                           {...{
  //                             className: header.column.getCanSort()
  //                               ? "cursor-pointer select-none"
  //                               : "",
  //                             onClick: header.column.getToggleSortingHandler(),
  //                           }}
  //                         >
  //                           {flexRender(
  //                             header.column.columnDef.header,
  //                             header.getContext()
  //                           )}
  //                           {{
  //                             asc: " 🔼",
  //                             desc: " 🔽",
  //                           }[header.column.getIsSorted() as string] ?? null}
  //                         </div>
  //                       )}
  //                     </Table.ColumnHeader>
  //                   );
  //                 })}
  //               </Table.Row>
  //             ))}
  //           </Table.Header>
  //           <Table.Body height={virtualizer.getTotalSize()}>
  //             {virtualizer.getVirtualItems().map((virtualRow, index) => {
  //               const row = rows[virtualRow.index];
  //               return (
  //                 <Table.Row
  //                   key={row.id}
  //                   style={{
  //                     height: `${virtualRow.size}px`,
  //                     position: 'absolute',
  //                     transform: `translateY(${
  //                       virtualRow.start - index * virtualRow.size
  //                     }px)`,
  //                   }}
  //                 >
  //                   {row.getVisibleCells().map((cell) => {
  //                     return (
  //                       <Table.Cell key={cell.id}>
  //                         {flexRender(
  //                           cell.column.columnDef.cell,
  //                           cell.getContext()
  //                         )}
  //                       </Table.Cell>
  //                     );
  //                   })}
  //                 </Table.Row>
  //               );
  //             })}
  //           </Table.Body>
  //         </Table.Root>
  //       </div>
  //   );

  //   return (
  //     <Table.ScrollArea ref={parentRef} borderWidth="1px" rounded="md" flex={1}>
  //       <Table.Root stickyHeader height={virtualizer.getTotalSize()}>
  //         <Table.Header>
  //           {table.getHeaderGroups().map((headerGroup) => (
  //             <Table.Row key={headerGroup.id}>
  //               {headerGroup.headers.map((header) => (
  //                 <Table.ColumnHeader
  //                   style={{ width: header.getSize() }}
  //                   colSpan={header.colSpan}
  //                   key={header.id}
  //                 >
  //                   {header.isPlaceholder ? null : (
  //                     <div
  //                       {...{
  //                         className: header.column.getCanSort()
  //                           ? "cursor-pointer select-none"
  //                           : "",
  //                         onClick: header.column.getToggleSortingHandler(),
  //                       }}
  //                     >
  //                       {flexRender(
  //                         header.column.columnDef.header,
  //                         header.getContext()
  //                       )}
  //                       {{
  //                         asc: " 🔼",
  //                         desc: " 🔽",
  //                       }[header.column.getIsSorted() as string] ?? null}
  //                     </div>
  //                   )}
  //                 </Table.ColumnHeader>
  //               ))}
  //             </Table.Row>
  //           ))}
  //         </Table.Header>
  //         <Table.Body>
  //           {virtualizer.getVirtualItems().map((virtualRow) => {
  //             const row = rows[virtualRow.index];
  //             return (
  //               <Table.Row
  //                 key={row.id}
  //                 height={virtualRow.size}
  //                 position={"absolute"}
  //                 style={{
  //                   transform: `translateY(${virtualRow.start}px)`,
  //                 }}
  //               >
  //                 {row.getVisibleCells().map((cell) => {
  //                   return (
  //                     <Table.Cell key={cell.id}>
  //                       {flexRender(
  //                         cell.column.columnDef.cell,
  //                         cell.getContext()
  //                       )}
  //                     </Table.Cell>
  //                   );
  //                 })}
  //               </Table.Row>
  //             );
  //           })}
  //         </Table.Body>
  //       </Table.Root>
  //     </Table.ScrollArea>
  //   );
};
