import {
  ColumnDef,
  ColumnFiltersState,
  ColumnPinningState,
  ColumnResizeMode,
  flexRender,
  OnChangeFn,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { getCoreRowModel } from "@tanstack/table-core";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import DebouncedInput from "@/components/shared/DebounceInput";
import SelectFilter from "@/components/shared/SelectFilter";
import DateRangeFilter from "@/components/shared/DateRangeFilter";
import { cn } from "@/lib/utils";
import MultiSelectFilter from "@/components/shared/MultiSelectFilter";

interface Props<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[];
  pageCount?: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  showFilters: boolean;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnPinning?: ColumnPinningState;
  onColumnPinningChange?: (updater: ColumnPinningState | ((old: ColumnPinningState) => ColumnPinningState)) => void;
  isLoading?: boolean;
  centerTextColumns?: string[];
}

function DataTable<TData, TValue>({
  columns,
  data = [],
  pageCount = 0,
  pagination,
  onPaginationChange,
  showFilters = true,
  columnFilters = [],
  onColumnFiltersChange,
  sorting = [],
  onSortingChange,
  columnPinning,
  onColumnPinningChange,
  isLoading = false,
  centerTextColumns,
}: Props<TData, TValue>) {
  const [columnResizeMode] = useState<ColumnResizeMode>("onChange");

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
      columnFilters,
      sorting,
      columnPinning,
    },
    onPaginationChange,
    onColumnFiltersChange,
    onSortingChange,
    onColumnPinningChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    enableColumnResizing: true,
    enableColumnPinning: true,
    columnResizeMode,
    columnResizeDirection: "ltr",
  });

  const renderFilter = (header: any) => {
    if (!header.column.getCanFilter()) return null;

    const filterConfig = header.column.columnDef.meta?.filterConfig;
    const filterValue = header.column.getFilterValue() ?? "";

    // If no config, default to text input
    if (!filterConfig || filterConfig.type === "text") {
      return (
        <DebouncedInput
          placeholder={filterConfig?.placeholder ?? "Search..."}
          value={filterValue as string}
          onChange={value => {
            header.column.setFilterValue(value || undefined);
          }}
          className="h-8"
        />
      );
    }

    // Select filter
    if (filterConfig.type === "select") {
      return (
        <SelectFilter
          value={filterValue as string}
          onChange={value => {
            header.column.setFilterValue(value);
          }}
          options={filterConfig.options || []}
          placeholder={filterConfig.placeholder}
        />
      );
    }

    if (filterConfig.type === "multiSelect") {
      return (
        <MultiSelectFilter
          value={filterValue}
          onChange={value => {
            header.column.setFilterValue(value);
          }}
          options={filterConfig.options || []}
          placeholder={filterConfig.placeholder}
          isLoading={filterConfig.isLoading}
        />
      );
    }

    // Date range filter
    if (filterConfig.type === "dateRange") {
      return (
        <DateRangeFilter
          value={filterValue as string}
          onChange={value => {
            header.column.setFilterValue(value);
          }}
        />
      );
    }

    return null;
  };

  const renderSortIcon = (header: any) => {
    if (!header.column.getCanSort()) return null;

    const isSorted = header.column.getIsSorted();

    if (isSorted === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }

    if (isSorted === "desc") {
      return <ArrowDown className="ml-2 h-4 w-4" />;
    }

    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
  };

  const getPinnedStyles = (isPinned: "left" | "right" | false) => {
    if (isPinned === "left") {
      return 'sticky left-0 z-20 bg-white after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[2px] after:bg-gray-300 after:content-[""]';
    }
    if (isPinned === "right") {
      return 'sticky right-0 z-20 bg-white before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-gray-300 before:content-[""] shadow-[-8px_0_15px_-3px_rgba(0,0,0,0.15)]';
    }
    return "";
  };

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="flex items-center justify-between px-2 py-2">
        {/* Results Info */}
        <div className="text-sm text-muted-foreground">
          Page {pagination.pageIndex + 1} of {pageCount}
          {data.length > 0 && (
            <span className="ml-2">
              (Showing {data.length} {data.length === 1 ? "result" : "results"})
            </span>
          )}
        </div>

        {/* Pagination Buttons */}
        <div className="flex items-center space-x-6 h-8">
          {/* Rows per page selector */}
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              value={pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value));
              }}
              className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm"
            >
              {[5, 10, 20, 30, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              Last
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table style={{ width: table.getCenterTotalSize() }}>
          <TableHeader>
            {table.getHeaderGroups().map(group => (
              <TableRow key={group.id} className="h-16">
                {group.headers.map(header => {
                  const canSort = header.column.getCanSort();
                  const isPinned = header.column.getIsPinned();

                  return (
                    <th
                      key={header.id}
                      className={cn("border px-4 py-2 relative ", getPinnedStyles(isPinned))}
                      style={{
                        width: header.getSize(),
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex items-center justify-center",
                            canSort && "cursor-pointer select-none hover:bg-muted/50 -mx-4 -my-2 px-4 py-2"
                          )}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {renderSortIcon(header)}
                        </div>
                      )}

                      {/* Resize Handle */}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none group",
                            "hover:bg-primary transition-all"
                          )}
                        >
                          {/* Visual indicator */}
                          <div
                            className={cn(
                              "absolute inset-y-0 -left-1 w-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                              header.column.getIsResizing() && "opacity-100"
                            )}
                          >
                            <div className="w-0.5 h-8 bg-primary rounded-full" />
                          </div>
                        </div>
                      )}
                    </th>
                  );
                })}
              </TableRow>
            ))}

            {/* Filter row */}
            {table.getHeaderGroups().map(group => (
              <TableRow
                key={`${group.id}-filter`}
                className={cn(
                  "border-b transition-all duration-400 ease-in-out overflow-hidden",
                  showFilters ? "h-12 opacity-100 translate-y-0" : "h-0 opacity-0 -translate-y-2"
                )}
              >
                {group.headers.map(header => {
                  const isPinned = header.column.getIsPinned();

                  return (
                    <th
                      key={`${header.id}-filter`}
                      className={cn(
                        "border transition-all duration-300",
                        showFilters ? "px-2 py-2" : "px-2 py-0",
                        getPinnedStyles(isPinned)
                      )}
                      style={{
                        width: header.getSize(),
                      }}
                    >
                      {/* Keep conditional rendering only for the filter content */}
                      <div
                        className={cn(
                          "transition-opacity duration-200",
                          showFilters ? "opacity-100 delay-100" : "opacity-0"
                        )}
                      >
                        {showFilters && renderFilter(header)}
                      </div>
                    </th>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="h-12">
                  {row.getVisibleCells().map(cell => {
                    const isPinned = cell.column.getIsPinned();
                    const isCenterText = centerTextColumns?.includes(cell.getContext().column.id);

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn("border px-4 py-2", isCenterText ? "text-center" : "", getPinnedStyles(isPinned))}
                        style={{
                          width: cell.column.getSize(),
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default DataTable;
