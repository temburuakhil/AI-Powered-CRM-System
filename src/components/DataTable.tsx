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
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, CheckCircle2, XCircle } from "lucide-react";

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

  // Helper function to render status cells with icons and colors
  const renderCellContent = (value: any, columnName: string) => {
    const stringValue = String(value).toLowerCase().trim();
    const isStatusColumn = columnName.toLowerCase().includes('status') || 
                          columnName.toLowerCase().includes('registration') ||
                          columnName.toLowerCase().includes('interest');
    
    if (isStatusColumn) {
      // Check for completed status
      if (stringValue === 'completed' || stringValue === 'complete' || stringValue === 'yes') {
        return (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#3fb950] flex-shrink-0" />
            <span className="text-[#3fb950] font-medium">Completed</span>
          </div>
        );
      }
      // Check for incomplete/pending status
      if (stringValue === 'incomplete' || stringValue === 'not completed' || 
          stringValue === 'pending' || stringValue === 'no' || stringValue === 'not complete') {
        return (
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-[#f85149] flex-shrink-0" />
            <span className="text-[#f85149] font-medium">Incomplete</span>
          </div>
        );
      }
    }
    
    return String(value);
  };

  if (data.length === 0) {
    return (
      <div className="bg-[#0d1117] rounded-lg shadow-sm border border-[#30363d] p-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-lg bg-[#1c2128] mx-auto flex items-center justify-center">
            <svg className="w-8 h-8 text-[#7d8590]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-[#e6edf3]">No data available</p>
            <p className="text-sm text-[#7d8590]">Waiting for data to load...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Search Bar */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1f6feb]/10 via-[#a371f7]/10 to-[#f778ba]/10 rounded-lg blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#7d8590] group-focus-within:text-[#58a6ff] transition-all duration-200" />
          <Input
            placeholder="Search anything..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 h-12 text-base border border-[#30363d] bg-[#0d1117] text-[#e6edf3] rounded-lg hover:border-[#58a6ff] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all duration-200"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-[#0d1117] rounded-lg border border-[#30363d] overflow-hidden hover:border-[#58a6ff] transition-all duration-300">
        <div className="overflow-x-auto max-w-full">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#30363d] bg-[#010409] hover:bg-[#010409]">
                {columns.map((column) => (
                  <TableHead key={column} className="h-12 first:pl-6 max-w-[250px]">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column)}
                      className="h-auto p-0 hover:bg-transparent font-semibold text-xs text-[#7d8590] hover:text-[#58a6ff] transition-all duration-200 uppercase tracking-wider truncate max-w-full"
                    >
                      <span className="truncate">{column}</span>
                      <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50 flex-shrink-0" />
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((row, idx) => (
                <TableRow 
                  key={idx} 
                  className="border-b border-[#30363d] hover:bg-[#1c2128] transition-all duration-200 group"
                >
                  {columns.map((column, colIdx) => (
                    <TableCell 
                      key={column} 
                      className={`py-4 text-[#e6edf3] group-hover:text-white transition-colors max-w-[250px] break-words ${colIdx === 0 ? 'pl-6 font-semibold' : ''}`}
                    >
                      {renderCellContent(row[column], column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-[#010409] border-t border-[#30363d]">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#58a6ff] to-[#a371f7] animate-pulse"></div>
              <span className="text-[#7d8590]">
                Showing <span className="font-bold text-[#e6edf3] px-2 py-0.5 bg-[#1c2128] rounded">{filteredAndSortedData.length}</span> of <span className="font-bold text-[#e6edf3] px-2 py-0.5 bg-[#1c2128] rounded">{data.length}</span> records
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1f6feb]/10 rounded-full border border-[#1f6feb]/30">
              <div className="relative flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#58a6ff]"></div>
                <div className="absolute w-1.5 h-1.5 rounded-full bg-[#58a6ff] animate-ping"></div>
              </div>
              <span className="text-xs font-semibold text-[#58a6ff]">Auto-refreshing every 5s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
