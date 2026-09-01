'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export default function DataTable<T>({ data, columns, keyExtractor, onRowClick, isLoading }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#ebdccd] rounded-sm p-10 flex justify-center items-center">
        <div className="w-6 h-6 border-2 border-[#9b7e46] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border border-[#ebdccd] rounded-sm p-10 flex flex-col justify-center items-center text-center">
        <p className="text-sm text-[#73685a] font-medium">No records found.</p>
        <p className="text-xs text-[#9ca3af] mt-1">This view currently has no entries to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#ebdccd] rounded-sm shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#faf8f5] border-b border-[#ebdccd]">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold text-[#73685a]"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebdccd]/50">
            {data.map((item) => (
              <tr 
                key={keyExtractor(item)} 
                onClick={() => onRowClick && onRowClick(item)}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-[#faf8f5]' : ''}`}
              >
                {columns.map((col, idx) => (
                  <td key={idx} className="px-6 py-4 text-xs text-[#141210] align-middle">
                    {col.cell ? col.cell(item) : col.accessorKey ? (item[col.accessorKey] as React.ReactNode) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination (Visual Only for now) */}
      <div className="px-6 py-4 border-t border-[#ebdccd] flex items-center justify-between bg-[#faf8f5]">
        <span className="text-[10px] text-[#73685a] uppercase tracking-wider font-medium">
          Showing {data.length} records
        </span>
        <div className="flex items-center gap-2">
          <button className="p-1 text-[#9ca3af] hover:text-[#141210] transition-colors disabled:opacity-50" disabled>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-[#141210]">1</span>
          <button className="p-1 text-[#9ca3af] hover:text-[#141210] transition-colors disabled:opacity-50" disabled>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
