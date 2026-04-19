import React from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
  keyExtractor: (item: T) => string | number;
}

export function Table<T>({
  columns, data, isLoading = false,
  emptyMessage = "Nenhum item encontrado.",
  emptyIcon = "📭",
  keyExtractor,
}: TableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-700/40">
              {columns.map((col) => (
                <th key={col.key} className={`px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 ${col.className ?? ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-4">
                        <div className={`h-4 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700 ${i % 2 === 0 ? "w-3/4" : "w-1/2"}`} />
                      </td>
                    ))}
                  </tr>
                ))
              : data.length === 0
              ? (
                  <tr>
                    <td colSpan={columns.length}>
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <span className="text-4xl">{emptyIcon}</span>
                        <p className="mt-3 text-sm font-medium text-gray-400 dark:text-gray-500">{emptyMessage}</p>
                      </div>
                    </td>
                  </tr>
                )
              : data.map((item, rowIndex) => (
                  <tr key={keyExtractor(item)} className={`transition-colors hover:bg-gray-50/70 dark:hover:bg-gray-700/30 ${rowIndex % 2 !== 0 ? "bg-gray-50/30 dark:bg-gray-700/10" : ""}`}>
                    {columns.map((col) => (
                      <td key={col.key} className={`px-5 py-4 text-gray-700 dark:text-gray-300 ${col.className ?? ""}`}>
                        {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
