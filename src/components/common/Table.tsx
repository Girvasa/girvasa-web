import React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = "No records found.",
  onRowClick,
  className,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="animate-pulse space-y-4 p-6">
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 rounded bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} scope="col" className={cn("px-6 py-3.5", col.headerClassName)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    "transition-colors hover:bg-slate-50/70",
                    onRowClick ? "cursor-pointer" : ""
                  )}
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={cn("px-6 py-4 whitespace-nowrap", col.className)}>
                      {typeof col.accessor === "function"
                        ? col.accessor(row)
                        : col.accessor
                        ? (row[col.accessor] as any)
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
