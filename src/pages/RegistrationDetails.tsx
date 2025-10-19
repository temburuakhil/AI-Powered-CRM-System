import { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

// Google Sheets Configuration
const SCHEMES_SHEET_ID = "1y7LyjjyKRMX4XSTjPA3lu4hM9gMl27e2QElXiG4FZp8";
const SCHEMES_REGISTRATION_GID = "661516192"; // Registration Details sheet GID for Schemes

const SCHOLARSHIP_SHEET_ID = "1mKHy1nYMGc_EGkA7X1T8609SPYBkhdBMwYlZSzfPfqk";
const SCHOLARSHIP_REGISTRATION_GID = "1274670035"; // Registration Details sheet GID for Scholarships

// Webhook URLs for Approve/Reject
const SCHEMES_APPROVE_REJECT_WEBHOOK = "https://saumojitsantra.app.n8n.cloud/webhook/11b3e19c-8b56-4791-8476-b50444605434";
const SCHOLARSHIP_APPROVE_REJECT_WEBHOOK = "https://saumojitsantra.app.n8n.cloud/webhook/494a460f-803d-4848-b729-9fecebe4ff79";

const RegistrationDetails = () => {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [processingRows, setProcessingRows] = useState<Set<number>>(new Set());
  const [rowStatus, setRowStatus] = useState<Map<string, 'approved' | 'rejected'>>(new Map());
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine which sheet to use based on the route
  const isScholarship = location.pathname.includes('scholarship');
  const SHEET_ID = isScholarship ? SCHOLARSHIP_SHEET_ID : SCHEMES_SHEET_ID;
  const REGISTRATION_GID = isScholarship ? SCHOLARSHIP_REGISTRATION_GID : SCHEMES_REGISTRATION_GID;
  const STORAGE_KEY = isScholarship ? 'scholarshipRegistrationStatuses' : 'registrationStatuses';
  const APPROVE_REJECT_WEBHOOK = isScholarship ? SCHOLARSHIP_APPROVE_REJECT_WEBHOOK : SCHEMES_APPROVE_REJECT_WEBHOOK;

  // Load saved statuses from localStorage on mount
  useEffect(() => {
    const savedStatuses = localStorage.getItem(STORAGE_KEY);
    if (savedStatuses) {
      try {
        const parsed = JSON.parse(savedStatuses);
        const statusMap = new Map<string, 'approved' | 'rejected'>();
        Object.entries(parsed).forEach(([key, value]) => {
          statusMap.set(key, value as 'approved' | 'rejected');
        });
        setRowStatus(statusMap);
      } catch (e) {
        console.error('Error loading saved statuses:', e);
      }
    }
  }, [STORAGE_KEY]);

  // Save statuses to localStorage whenever they change
  useEffect(() => {
    if (rowStatus.size > 0) {
      const statusObj = Object.fromEntries(rowStatus);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statusObj));
    }
  }, [rowStatus, STORAGE_KEY]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${REGISTRATION_GID}`;
      const response = await fetch(csvUrl);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setData(results.data);
          }
        },
        error: (error) => {
          setError(`Failed to parse data: ${error.message}`);
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch data";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (rowIndex: number, rowData: Record<string, any>) => {
    setProcessingRows(prev => new Set(prev).add(rowIndex));
    
    // Get unique identifier for this row
    const rowId = String(rowData.ID || rowData.id || rowData.Id || rowData.Email || rowIndex);
    
    try {
      // Prepare data to send to webhook
      const webhookData = {
        action: "approve",
        id: rowData.ID || rowData.id || rowData.Id,
        name: rowData.Name || rowData.name,
        email: rowData.Email || rowData.email,
        phoneNumber: rowData["Phone Number"] || rowData.phone_number || rowData.phoneNumber || rowData.Phone,
      };

      // Send to webhook using Image technique to bypass CORS
      const params = new URLSearchParams({
        action: webhookData.action,
        id: String(webhookData.id || ''),
        name: String(webhookData.name || ''),
        email: String(webhookData.email || ''),
        phoneNumber: String(webhookData.phoneNumber || ''),
      });
      
      const img = new Image();
      img.src = `${APPROVE_REJECT_WEBHOOK}?${params.toString()}&t=${Date.now()}`;
      
      // Give it a moment to trigger
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "✅ Approved",
        description: `Registration for ${rowData.Name || 'User'} has been approved.`,
      });
      
      // Set the row status to approved using the unique ID
      setRowStatus(prev => new Map(prev).set(rowId, 'approved'));
      
      // Refresh data after approval
      fetchData();
    } catch (error) {
      console.error('Error sending approval:', error);
      toast({
        title: "Error",
        description: `Failed to approve registration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setProcessingRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(rowIndex);
        return newSet;
      });
    }
  };

  const handleReject = async (rowIndex: number, rowData: Record<string, any>) => {
    setProcessingRows(prev => new Set(prev).add(rowIndex));
    
    // Get unique identifier for this row
    const rowId = String(rowData.ID || rowData.id || rowData.Id || rowData.Email || rowIndex);
    
    try {
      // Prepare data to send to webhook
      const webhookData = {
        action: "reject",
        id: rowData.ID || rowData.id || rowData.Id,
        name: rowData.Name || rowData.name,
        email: rowData.Email || rowData.email,
        phoneNumber: rowData["Phone Number"] || rowData.phone_number || rowData.phoneNumber || rowData.Phone,
      };

      // Send to webhook using Image technique to bypass CORS
      const params = new URLSearchParams({
        action: webhookData.action,
        id: String(webhookData.id || ''),
        name: String(webhookData.name || ''),
        email: String(webhookData.email || ''),
        phoneNumber: String(webhookData.phoneNumber || ''),
      });
      
      const img = new Image();
      img.src = `${APPROVE_REJECT_WEBHOOK}?${params.toString()}&t=${Date.now()}`;
      
      // Give it a moment to trigger
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "❌ Rejected",
        description: `Registration for ${rowData.Name || 'User'} has been rejected.`,
        variant: "destructive",
      });
      
      // Set the row status to rejected using the unique ID
      setRowStatus(prev => new Map(prev).set(rowId, 'rejected'));
      
      // Refresh data after rejection
      fetchData();
    } catch (error) {
      console.error('Error sending rejection:', error);
      toast({
        title: "Error",
        description: `Failed to reject registration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setProcessingRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(rowIndex);
        return newSet;
      });
    }
  };

  const handleRevoke = async (rowIndex: number, rowData: Record<string, any>) => {
    // Get unique identifier for this row
    const rowId = String(rowData.ID || rowData.id || rowData.Id || rowData.Email || rowIndex);
    
    // Remove the status from localStorage and state
    setRowStatus(prev => {
      const newMap = new Map(prev);
      newMap.delete(rowId);
      return newMap;
    });
    
    // Update localStorage
    const statusObj = Object.fromEntries(
      Array.from(rowStatus.entries()).filter(([key]) => key !== rowId)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statusObj));
    
    toast({
      title: "Status Revoked",
      description: "The approval/rejection has been revoked successfully",
    });
  };

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 ${isScholarship ? 'via-purple-50/30 to-pink-50/30' : 'via-green-50/30 to-emerald-50/30'} dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center`}>
        <div className="text-center space-y-8">
          <div className="relative inline-block">
            <div className={`w-20 h-20 rounded-3xl ${isScholarship ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 shadow-purple-500/40' : 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 shadow-green-500/40'} mx-auto flex items-center justify-center animate-pulse shadow-2xl`}>
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Loading Registration Details</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 ${isScholarship ? 'via-purple-50/30 to-pink-50/30' : 'via-green-50/30 to-emerald-50/30'} dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6`}>
        <div className="max-w-md w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-red-200/60 dark:border-red-900/60 p-10 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center shadow-lg">
            <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Connection Error</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{error}</p>
          </div>
          <div className="pt-2 space-y-3">
            <button 
              onClick={() => fetchData()} 
              className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate("/")} 
              className="w-full px-4 py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 ${isScholarship ? 'via-purple-50/30 to-pink-50/30' : 'via-green-50/30 to-emerald-50/30'} dark:from-slate-950 dark:via-slate-900 dark:to-slate-950`}>
      {/* Header */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate(isScholarship ? "/scholarships" : "/schemes")}
                variant="outline"
                className="rounded-xl"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {isScholarship ? 'Scholarships' : 'Schemes'}
              </Button>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl ${isScholarship ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 shadow-purple-500/30' : 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 shadow-green-500/30'} flex items-center justify-center shadow-lg`}>
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className={`absolute inset-0 rounded-xl ${isScholarship ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-gradient-to-br from-green-500 to-teal-600'} blur-md opacity-40 -z-10`}></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                    {isScholarship ? 'Scholarship' : 'Scheme'} Registration Details
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Review and approve registrations</p>
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full ${isScholarship ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/60 dark:border-purple-800/60' : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/60 dark:border-green-800/60'} shadow-sm`}>
              <span className={`text-sm font-semibold ${isScholarship ? 'text-purple-700 dark:text-purple-400' : 'text-green-700 dark:text-green-400'}`}>
                {filteredData.length} Registration{filteredData.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">
        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-green-600 dark:group-focus-within:text-green-400 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              placeholder="Search registrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 pr-6 h-14 text-base border-2 border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 focus:shadow-2xl focus:border-green-500 dark:focus:border-green-500 transition-all duration-300 font-medium"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-slate-50 via-green-50/30 to-emerald-50/30 dark:from-slate-800/50 dark:via-slate-800/50 dark:to-slate-800/50">
                  {columns.map((column) => (
                    <TableHead key={column} className="whitespace-nowrap h-14 first:pl-8 font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      {column}
                    </TableHead>
                  ))}
                  <TableHead className="whitespace-nowrap h-14 font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wide text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">No registrations found</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : 
                  filteredData.map((row, idx) => {
                    // Calculate unique row ID for persistence
                    const rowId = String(row.ID || row.id || row.Id || row.Email || idx);
                    
                    return (
                      <TableRow 
                        key={idx}
                        className="border-b border-slate-100/80 dark:border-slate-800/80 hover:bg-gradient-to-r hover:from-green-50/40 hover:via-transparent hover:to-emerald-50/40 dark:hover:from-slate-800/40 dark:hover:via-transparent dark:hover:to-slate-800/40 transition-all duration-200"
                      >
                        {columns.map((column) => (
                          <TableCell 
                            key={column}
                            className="whitespace-nowrap py-5 text-slate-700 dark:text-slate-300 font-medium first:pl-8"
                          >
                            {String(row[column])}
                          </TableCell>
                        ))}
                        <TableCell className="whitespace-nowrap py-5">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              onClick={() => handleApprove(idx, row)}
                              disabled={processingRows.has(idx) || rowStatus.has(rowId)}
                              className={
                                rowStatus.get(rowId) === 'approved'
                                  ? "bg-green-600 text-white cursor-not-allowed opacity-80"
                                  : rowStatus.get(rowId) === 'rejected'
                                  ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                              }
                              size="sm"
                            >
                              {processingRows.has(idx) ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Processing...
                                </>
                              ) : rowStatus.get(rowId) === 'approved' ? (
                                <>
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Approved
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleReject(idx, row)}
                              disabled={processingRows.has(idx) || rowStatus.has(rowId)}
                              className={
                                rowStatus.get(rowId) === 'rejected'
                                  ? "bg-red-600 text-white cursor-not-allowed opacity-80"
                                  : rowStatus.get(rowId) === 'approved'
                                  ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                                  : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                              }
                              size="sm"
                            >
                              {processingRows.has(idx) ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Processing...
                                </>
                              ) : rowStatus.get(rowId) === 'rejected' ? (
                                <>
                                  <XCircle className="mr-1 h-4 w-4" />
                                  Rejected
                                </>
                              ) : (
                                <>
                                  <XCircle className="mr-1 h-4 w-4" />
                                  Reject
                                </>
                              )}
                            </Button>
                            
                            {/* Revoke Button - Only show if status exists */}
                            {rowStatus.has(rowId) && (
                              <Button
                                onClick={() => handleRevoke(idx, row)}
                                disabled={processingRows.has(idx)}
                                className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                                size="sm"
                                title="Revoke approval/rejection"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                }
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-gradient-to-r from-slate-50 via-green-50/30 to-emerald-50/30 dark:from-slate-800/50 dark:via-slate-800/50 dark:to-slate-800/50 border-t-2 border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse"></div>
                <span className="text-slate-600 dark:text-slate-400">
                  Showing <span className="font-bold text-slate-900 dark:text-white px-1.5 py-0.5 bg-slate-200/60 dark:bg-slate-700/60 rounded-md">{filteredData.length}</span> of <span className="font-bold text-slate-900 dark:text-white px-1.5 py-0.5 bg-slate-200/60 dark:bg-slate-700/60 rounded-md">{data.length}</span> registrations
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDetails;
