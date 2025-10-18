import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataTableProps {
  data: Record<string, any>[];
  maxRows?: number;
}

export const DataTable = ({ data, maxRows = 10 }: DataTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filter
    if (searchTerm) {
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        const modifier = sortDirection === "asc" ? 1 : -1;

        if (typeof aVal === "number" && typeof bVal === "number") {
          return (aVal - bVal) * modifier;
        }
        return String(aVal).localeCompare(String(bVal)) * modifier;
      });
    }

    return result.slice(0, maxRows);
  }, [data, searchTerm, sortColumn, sortDirection, maxRows]);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">No data available</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Waiting for data to load...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Search Bar with Modern Glass Effect */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
        <div className="relative">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-all duration-200" />
          <Input
            placeholder="Search anything..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 pr-6 h-14 text-base border-2 border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 focus:shadow-2xl focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300 font-medium"
          />
        </div>
      </div>

      {/* Premium Table Card with Enhanced Shadow and Border */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-slate-200/60 dark:border-slate-800/60 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-800/50 dark:via-slate-800/50 dark:to-slate-800/50">
                {columns.map((column) => (
                  <TableHead key={column} className="whitespace-nowrap h-14 first:pl-8">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column)}
                      className="h-auto p-0 hover:bg-transparent font-bold text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 uppercase tracking-wide"
                    >
                      {column}
                      <ArrowUpDown className="ml-2 h-4 w-4 opacity-40 group-hover:opacity-100" />
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((row, idx) => (
                <TableRow 
                  key={idx} 
                  className="border-b border-slate-100/80 dark:border-slate-800/80 hover:bg-gradient-to-r hover:from-blue-50/40 hover:via-transparent hover:to-purple-50/40 dark:hover:from-slate-800/40 dark:hover:via-transparent dark:hover:to-slate-800/40 transition-all duration-200 group"
                >
                  {columns.map((column, colIdx) => (
                    <TableCell 
                      key={column} 
                      className={`whitespace-nowrap py-5 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors font-medium ${colIdx === 0 ? 'pl-8 font-semibold' : ''}`}
                    >
                      {String(row[column])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Premium Footer with Gradient Background */}
        <div className="px-8 py-5 bg-gradient-to-r from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-800/50 dark:via-slate-800/50 dark:to-slate-800/50 border-t-2 border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
              <span className="text-slate-600 dark:text-slate-400">
                Showing <span className="font-bold text-slate-900 dark:text-white px-1.5 py-0.5 bg-slate-200/60 dark:bg-slate-700/60 rounded-md">{filteredAndSortedData.length}</span> of <span className="font-bold text-slate-900 dark:text-white px-1.5 py-0.5 bg-slate-200/60 dark:bg-slate-700/60 rounded-md">{data.length}</span> records
              </span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-blue-100/60 dark:bg-blue-900/20 rounded-full border border-blue-200/60 dark:border-blue-800/60">
              <div className="relative flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                <div className="absolute w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping"></div>
              </div>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Auto-refreshing every 5s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
