import { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SHEET_ID = "1hyc1ZkQK9C6aVUvLe-jS-EiElQtIfKiUzDR0CNwv_oo";
const FEEDBACK_GID = "129275932";

const Feedback = () => {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with true for initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load
  const [lastUpdated, setLastUpdated] = useState<Date>();
  const [error, setError] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setError("");

    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${FEEDBACK_GID}`;
      const response = await fetch(csvUrl);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setData(results.data);
            setLastUpdated(new Date());
            setIsInitialLoad(false);
          } else {
            setError("No feedback data found");
          }
        },
        error: (error) => {
          setError(`Failed to parse feedback data: ${error.message}`);
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch feedback data";
      setError(message);
      if (showLoading) {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [toast]);

  // Initial fetch on mount
  useEffect(() => {
    fetchData(true); // Show loading on initial fetch
  }, [fetchData]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(false); // Don't show loading on auto-refresh
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [fetchData]);

  // Get columns dynamically from the first row
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  if (isLoading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 mx-auto flex items-center justify-center animate-pulse shadow-2xl shadow-green-500/40">
              <MessageSquareText className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-500 to-teal-600 animate-ping opacity-30"></div>
          </div>
          <div className="space-y-3">
            <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Loading Feedback
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Fetching student feedback and ratings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-red-200/60 dark:border-red-900/60 p-10 space-y-6">
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Error Loading Feedback</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{error}</p>
          </div>
          <Button onClick={() => navigate("/")} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <MessageSquareText className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 blur-md opacity-40 -z-10"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                  Student Feedback
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Course ratings and suggestions
                </p>
              </div>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 px-3 py-2 rounded-lg">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-slate-50 via-green-50/30 to-emerald-50/30 dark:from-slate-800/50 dark:via-slate-800/50 dark:to-slate-800/50">
                  <TableHead className="whitespace-nowrap h-14 pl-8 font-bold text-sm text-slate-700 dark:text-slate-300 uppercase">
                    SL NO.
                  </TableHead>
                  {columns.map((column) => (
                    <TableHead key={column} className="whitespace-nowrap h-14 font-bold text-sm text-slate-700 dark:text-slate-300 uppercase">
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow
                    key={idx}
                    className="border-b border-slate-100/80 dark:border-slate-800/80 hover:bg-gradient-to-r hover:from-green-50/40 hover:via-transparent hover:to-emerald-50/40 dark:hover:from-slate-800/40 dark:hover:via-transparent dark:hover:to-slate-800/40 transition-all duration-200"
                  >
                    <TableCell className="pl-8 py-5 font-semibold text-slate-700 dark:text-slate-300">
                      {idx + 1}
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={column} className="py-5 text-slate-700 dark:text-slate-300">
                        {/* Special styling for Rating column */}
                        {column.toLowerCase().includes('rating') ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-amber-600 dark:text-amber-400">
                              {row[column]}
                            </span>
                            <span className="text-amber-500">⭐</span>
                          </div>
                        ) : (
                          <span>{String(row[column] || '-')}</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-gradient-to-r from-slate-50 via-green-50/30 to-emerald-50/30 dark:from-slate-800/50 dark:via-slate-800/50 dark:to-slate-800/50 border-t-2 border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse"></div>
                <span className="text-slate-600 dark:text-slate-400">
                  Showing <span className="font-bold text-slate-900 dark:text-white px-1.5 py-0.5 bg-slate-200/60 dark:bg-slate-700/60 rounded-md">{data.length}</span> feedback responses
                </span>
              </div>
              <div className="flex items-center gap-4">
                {data.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-400">Average Rating:</span>
                    <span className="font-bold text-lg text-amber-600 dark:text-amber-400">
                      {(() => {
                        const ratingColumn = columns.find(col => col.toLowerCase().includes('rating'));
                        if (!ratingColumn) return 'N/A';
                        const ratings = data.map(row => parseFloat(row[ratingColumn])).filter(r => !isNaN(r));
                        if (ratings.length === 0) return 'N/A';
                        const avg = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
                        return `${avg} ⭐`;
                      })()}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-green-100/60 dark:bg-green-900/20 rounded-full border border-green-200/60 dark:border-green-800/60">
                  <div className="relative flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></div>
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 animate-ping"></div>
                  </div>
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">Auto-refreshing every 5s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
