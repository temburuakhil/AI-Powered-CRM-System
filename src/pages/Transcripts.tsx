import { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, ExternalLink, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import SearchBar from "@/components/SearchBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SHEET_ID = "1hyc1ZkQK9C6aVUvLe-jS-EiElQtIfKiUzDR0CNwv_oo";
const TRANSCRIPT_GID = "1792576652";

const Transcripts = () => {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>();
  const [error, setError] = useState<string>("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [customManagers] = useState<Array<{id: string; name: string; projects: any[]}>>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setError("");

    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${TRANSCRIPT_GID}`;
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
            setError("No transcript data found");
          }
        },
        error: (error) => {
          setError(`Failed to parse transcript data: ${error.message}`);
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch transcript data";
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

  if (isLoading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-400 font-medium">Loading transcripts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#161b22] border border-[#30363d] rounded-lg p-8 space-y-4">
          <h3 className="text-xl font-bold text-[#e6edf3]">Error Loading Transcripts</h3>
          <p className="text-sm text-[#7d8590]">{error}</p>
          <Button onClick={() => navigate("/training")} className="w-full bg-[#238636] hover:bg-[#2ea043] text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Training
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex">
      <Sidebar 
        customManagers={customManagers} 
        onDeleteManager={() => {}}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Top Bar */}
        <header className="h-16 border-b border-[#30363d] bg-[#010409] px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <SearchBar customManagers={JSON.parse(localStorage.getItem("customManagers") || "[]")} />
          </div>
          <div className="flex items-center gap-6">
            {lastUpdated && (
              <div className="flex items-center gap-2 text-xs text-[#7d8590]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3fb950] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3fb950]"></span>
                </span>
                {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <button className="relative p-2 text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#1c2128] rounded-md transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#1f6feb] rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#58a6ff] to-[#1f6feb] flex items-center justify-center text-xs font-semibold">
              TR
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-[1800px] mx-auto p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/training")}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#1c2128] border border-[#30363d] rounded-md transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#58a6ff] to-[#1f6feb] flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Call Transcripts</h1>
                <p className="text-xs text-[#7d8590]">Call recordings and transcription data</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#7d8590]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3fb950] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3fb950]"></span>
              </span>
              Live Status
            </div>
          </div>

          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#30363d] bg-[#161b22] hover:bg-[#161b22]">
                    <TableHead className="h-12 px-6 text-xs font-semibold text-[#7d8590] uppercase">
                      SL NO.
                    </TableHead>
                    <TableHead className="h-12 px-6 text-xs font-semibold text-[#7d8590] uppercase">
                      TRANSCRIPT
                    </TableHead>
                    <TableHead className="h-12 px-6 text-xs font-semibold text-[#7d8590] uppercase">
                      CALL RECORDINGS
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, idx) => (
                    <TableRow
                      key={idx}
                      className="border-b border-[#21262d] hover:bg-[#161b22] transition-colors"
                    >
                      <TableCell className="px-6 py-4 text-[#e6edf3] font-medium">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-[#e6edf3] max-w-2xl">
                        <div className="line-clamp-3">
                          {row["Transcript"] || "No transcript available"}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {row["Call Recordings"] ? (
                          <a
                            href={row["Call Recordings"]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-sm rounded-md transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Play Recording
                          </a>
                        ) : (
                          <span className="text-[#7d8590] text-sm italic">
                            No recording
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#161b22] border-t border-[#30363d]">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[#7d8590]">
                    Showing <span className="font-semibold text-[#e6edf3]">{data.length}</span> transcripts
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#7d8590]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#58a6ff] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#58a6ff]"></span>
                  </span>
                  Auto-refreshing every 5s
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Transcripts;
