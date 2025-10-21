export type FilterType = "text" | "select" | "multiSelect" | "dateRange" | "none";

export interface FilterConfig {
  type: FilterType;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

// Extend TanStack's ColumnDef to include our filter config
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    filterConfig?: FilterConfig;
  }
}

export type SortDirection = "ASC" | "DESC" | null;

export interface SortState {
  column: string | null;
  direction: SortDirection;
}
