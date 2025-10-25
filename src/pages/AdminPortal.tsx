import { useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, Users, FileText, Plus, FolderKanban, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CustomManager {
  id: string;
  name: string;
  projects: any[];
}

// Sheet configurations for all three portals
const SCHEMES_SHEET_ID = "1y7LyjjyKRMX4XSTjPA3lu4hM9gMl27e2QElXiG4FZp8";
const SCHOLARSHIPS_SHEET_ID = "1mKHy1nYMGc_EGkA7X1T8609SPYBkhdBMwYlZSzfPfqk";
const TRAINING_SHEET_ID = "1hyc1ZkQK9C6aVUvLe-jS-EiElQtIfKiUzDR0CNwv_oo";
const TRAINING_SHEET1_GID = "0"; // Before Course Enrollment
const TRAINING_SHEET2_GID = "394964549"; // Course Completion

const AdminPortal = () => {
  const navigate = useNavigate();
  // Initialize from localStorage to avoid showing 0 initially
  const [apiHitCount, setApiHitCount] = useState(() => {
    return parseInt(localStorage.getItem("apiHitCount") || "0");
  });
  const [customManagers, setCustomManagers] = useState<CustomManager[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState<string | null>(null);

  const countCompletedStatuses = useCallback(async () => {
    try {
      let totalCompleted = 0;

      // Helper function to count completed in a sheet
      const countSheetCompleted = async (sheetId: string, gid?: string) => {
        const csvUrl = gid 
          ? `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
          : `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        
        const response = await fetch(csvUrl);
        const csvText = await response.text();

        return new Promise<number>((resolve) => {
          Papa.parse(csvText, {
            complete: (results) => {
              const data = results.data as string[][];
              let count = 0;
              if (data.length > 1) {
                // Count all "Completed" values in all columns (skip header row)
                for (let i = 1; i < data.length; i++) {
                  for (let j = 0; j < data[i].length; j++) {
                    const value = data[i][j]?.toString().toLowerCase().trim();
                    if (value === "completed") {
                      count++;
                    }
                  }
                }
              }
              resolve(count);
            },
            error: () => resolve(0),
          });
        });
      };

      // Count from Schemes sheet
      const schemesCount = await countSheetCompleted(SCHEMES_SHEET_ID);
      totalCompleted += schemesCount;

      // Count from Scholarships sheet
      const scholarshipsCount = await countSheetCompleted(SCHOLARSHIPS_SHEET_ID);
      totalCompleted += scholarshipsCount;

      // Count from Training - Before Course Enrollment
      const training1Count = await countSheetCompleted(TRAINING_SHEET_ID, TRAINING_SHEET1_GID);
      totalCompleted += training1Count;

      // Count from Training - Course Completion
      const training2Count = await countSheetCompleted(TRAINING_SHEET_ID, TRAINING_SHEET2_GID);
      totalCompleted += training2Count;

      console.log(`📊 Breakdown - Schemes: ${schemesCount}, Scholarships: ${scholarshipsCount}, Training1: ${training1Count}, Training2: ${training2Count}`);
      console.log(`📈 Total Completed in all sheets: ${totalCompleted}`);

      // Get stored values
      const storedApiHitCount = parseInt(localStorage.getItem("apiHitCount") || "0");
      const storedPreviousTotal = parseInt(localStorage.getItem("previousTotal") || "0");
      
      // Check if stored values seem incorrect (apiHitCount > totalCompleted by more than reasonable margin)
      // This can happen if there was testing/debugging that caused incorrect accumulation
      if (storedApiHitCount > totalCompleted && (storedApiHitCount - totalCompleted) > 10) {
        console.log(`🔄 Resetting API Hit Count from ${storedApiHitCount} to current total ${totalCompleted}`);
        localStorage.setItem("previousTotal", totalCompleted.toString());
        localStorage.setItem("apiHitCount", totalCompleted.toString());
        setApiHitCount(totalCompleted);
        return;
      }
      
      // First time initialization
      if (storedPreviousTotal === 0 && storedApiHitCount === 0) {
        // First run - initialize both to current total
        localStorage.setItem("previousTotal", totalCompleted.toString());
        localStorage.setItem("apiHitCount", totalCompleted.toString());
        setApiHitCount(totalCompleted);
        console.log(`🎬 Initial setup - API Hit Count set to: ${totalCompleted}`);
      } else {
        // Calculate new completions (only if total increased)
        const newCompletions = Math.max(0, totalCompleted - storedPreviousTotal);
        
        // Add new completions to cumulative count
        const updatedApiHitCount = storedApiHitCount + newCompletions;
        
        // Update stored values
        localStorage.setItem("previousTotal", totalCompleted.toString());
        localStorage.setItem("apiHitCount", updatedApiHitCount.toString());
        setApiHitCount(updatedApiHitCount);
        
        if (newCompletions > 0) {
          console.log(`✅ New completions detected: +${newCompletions}. API Hit Count: ${storedApiHitCount} → ${updatedApiHitCount}`);
        } else {
          console.log(`⏸️ No new completions. Current: ${totalCompleted}, API Hit Count: ${updatedApiHitCount}`);
        }
      }
    } catch (error) {
      console.error("Error counting completed statuses:", error);
      // Load from localStorage if fetch fails
      const storedMaxCount = parseInt(localStorage.getItem("apiHitCount") || "0");
      setApiHitCount(storedMaxCount);
    }
  }, []);

  // Load custom managers from localStorage
  useEffect(() => {
    const loadManagers = () => {
      const stored = localStorage.getItem('customManagers');
      if (stored) {
        try {
          const managers = JSON.parse(stored);
          setCustomManagers(managers);
        } catch (error) {
          console.error('Error loading managers:', error);
        }
      }
    };
    loadManagers();
  }, []);

  // Fetch API hit count from Google Sheets
  useEffect(() => {
    // Initial load
    countCompletedStatuses();
    
    // Refresh every 5 seconds
    const interval = setInterval(countCompletedStatuses, 5000);
    
    return () => clearInterval(interval);
  }, [countCompletedStatuses]);

  const handleDeleteManager = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setManagerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteManager = () => {
    if (managerToDelete) {
      const updatedManagers = customManagers.filter(m => m.id !== managerToDelete);
      setCustomManagers(updatedManagers);
      localStorage.setItem('customManagers', JSON.stringify(updatedManagers));
      setManagerToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 blur-lg opacity-40 -z-10"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                  Admin Portal
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Comprehensive management dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200/60 dark:border-purple-800/60 shadow-sm">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">API Hit Count: {apiHitCount}</span>
              </div>
              <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border border-orange-200/60 dark:border-orange-800/60 shadow-sm">
                <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">No. Of Campaigns running: 4</span>
              </div>
              <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/60 dark:border-blue-800/60 shadow-sm">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></div>
                </div>
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent mb-3">
            Welcome to Admin Portal
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Select a module to manage and monitor
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* E-Governance Card */}
          <div
            onClick={() => navigate("/e-governance")}
            className="group relative cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
            <div className="relative h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border-2 border-slate-200/60 dark:border-slate-800/60 shadow-xl hover:shadow-2xl transition-all duration-300 p-10 group-hover:scale-[1.02] group-hover:border-green-300/60 dark:group-hover:border-green-700/60">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-green-500/40 group-hover:shadow-green-500/60 transition-all duration-300 group-hover:scale-110">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 blur-md opacity-50 -z-10 group-hover:opacity-70 transition-opacity"></div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                    E-Governance
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Manage government schemes and scholarship programs
                  </p>
                  <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Model: GPT 4.1</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">2 Campaigns Running</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">Schemes</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">Scholarships</span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold group-hover:gap-3 transition-all">
                    <span>Access Portal</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Training Card */}
          <div
            onClick={() => navigate("/training")}
            className="group relative cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
            <div className="relative h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border-2 border-slate-200/60 dark:border-slate-800/60 shadow-xl hover:shadow-2xl transition-all duration-300 p-10 group-hover:scale-[1.02] group-hover:border-orange-300/60 dark:group-hover:border-orange-700/60">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 via-red-600 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-500/40 group-hover:shadow-orange-500/60 transition-all duration-300 group-hover:scale-110">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 blur-md opacity-50 -z-10 group-hover:opacity-70 transition-opacity"></div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-700 via-red-700 to-pink-700 dark:from-orange-400 dark:via-red-400 dark:to-pink-400 bg-clip-text text-transparent">
                    Training
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Training programs and skill development initiatives
                  </p>
                  <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border border-rose-200 dark:border-rose-800">
                    <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-sm font-semibold text-rose-700 dark:text-rose-400">Model: GPT 4.1</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800">
                    <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">2 Campaigns Running</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                    <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">Programs</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800">
                    <svg className="w-4 h-4 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-pink-700 dark:text-pink-400">Certifications</span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold group-hover:gap-3 transition-all">
                    <span>Access Portal</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Managers Section */}
        {customManagers.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent mb-2">
                Custom Managers
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your custom created management modules
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {customManagers.map((manager) => (
                <div
                  key={manager.id}
                  onClick={() => navigate(`/manager/${manager.id}`)}
                  className="group relative cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 rounded-2xl blur-lg opacity-15 group-hover:opacity-25 transition-all duration-500"></div>
                  <div className="relative h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border-2 border-slate-200/60 dark:border-slate-800/60 shadow-lg hover:shadow-xl transition-all duration-300 p-6 group-hover:scale-[1.02] group-hover:border-amber-300/60 dark:group-hover:border-amber-700/60">
                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteManager(manager.id, e)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                      title="Delete Manager"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>

                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-all duration-300 group-hover:scale-110">
                          <FolderKanban className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 blur-md opacity-40 -z-10 group-hover:opacity-60 transition-opacity"></div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-lg font-bold bg-gradient-to-r from-amber-700 via-orange-700 to-red-700 dark:from-amber-400 dark:via-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                          {manager.name}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {manager.projects.length} {manager.projects.length === 1 ? 'Project' : 'Projects'}
                        </p>
                      </div>

                      <div className="pt-2">
                        <div className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm group-hover:gap-3 transition-all">
                          <span>Open Manager</span>
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Create New Manager Card */}
              <div
                onClick={() => navigate("/create-manager")}
                className="group relative cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 rounded-2xl blur-lg opacity-15 group-hover:opacity-25 transition-all duration-500"></div>
                <div className="relative h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border-2 border-dashed border-slate-300/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300 p-6 group-hover:scale-[1.02] group-hover:border-violet-300/60 dark:group-hover:border-violet-700/60">
                  <div className="flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[200px]">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-md shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-all duration-300 group-hover:scale-110">
                        <Plus className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 blur-md opacity-40 -z-10 group-hover:opacity-60 transition-opacity"></div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                        Create New Manager
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Add a custom management module
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Manager Card - Show when no custom managers exist */}
        {customManagers.length === 0 && (
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent mb-2">
                Extend Your Portal
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Create custom managers to organize your projects
              </p>
            </div>

            <div
              onClick={() => navigate("/create-manager")}
              className="group relative cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
              <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border-2 border-dashed border-slate-300/60 dark:border-slate-700/60 shadow-xl hover:shadow-2xl transition-all duration-300 p-12 group-hover:scale-[1.02] group-hover:border-violet-300/60 dark:group-hover:border-violet-700/60">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/40 group-hover:shadow-violet-500/60 transition-all duration-300 group-hover:scale-110">
                      <Plus className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 blur-lg opacity-50 -z-10 group-hover:opacity-70 transition-opacity"></div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-2xl font-bold bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                      Create Your First Manager
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
                      Start building your custom CRM by creating a manager profile. Each manager can contain multiple projects with their own data sources.
                    </p>
                  </div>

                  <div className="pt-4">
                    <div className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold group-hover:gap-3 transition-all">
                      <span>Create Manager</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Select a module to view detailed analytics and management options
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Manager?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this manager and all its projects. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteManager}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPortal;
