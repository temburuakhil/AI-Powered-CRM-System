import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  FileText, 
  Plus, 
  Activity,
  Zap,
  TrendingUp,
  Bell,
  ChevronRight,
  Folder,
  GitBranch,
  LogOut
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";
import Sidebar from "@/components/layout/Sidebar";
import SearchBar from "@/components/SearchBar";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  // Initialize from localStorage to avoid showing 0 initially
  const [apiHitCount, setApiHitCount] = useState(() => {
    return parseInt(localStorage.getItem("apiHitCount") || "0");
  });
  const [customManagers, setCustomManagers] = useState<CustomManager[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      localStorage.removeItem('user');
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
      navigate('/landing');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

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
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex">
      {/* Sidebar */}
      <Sidebar 
        customManagers={customManagers} 
        onDeleteManager={handleDeleteManager}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Top Bar */}
        <header className="h-16 border-b border-[#30363d] bg-[#010409] px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <SearchBar customManagers={customManagers} />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#1c2128] rounded-md transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#1f6feb] rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#58a6ff] to-[#1f6feb] flex items-center justify-center text-xs font-semibold">
              AD
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#e6edf3] bg-[#0d1117] border border-[#30363d] rounded-md hover:border-[#58a6ff] hover:bg-[#1c2128] transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Page Title */}
          <div>
            <h2 className="text-2xl font-semibold text-[#e6edf3] mb-1">Dashboard</h2>
            <p className="text-sm text-[#7d8590]">Overview of your management portal</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* API Hits Card */}
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5 hover:border-[#58a6ff] transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#1f6feb]/10 rounded-md">
                    <Activity className="w-4 h-4 text-[#58a6ff]" />
                  </div>
                  <span className="text-sm text-[#7d8590] font-medium">API Hits</span>
                </div>
                <TrendingUp className="w-4 h-4 text-[#3fb950]" />
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-[#e6edf3] font-mono">{apiHitCount}</div>
                <div className="flex items-center gap-1 text-xs text-[#3fb950]">
                  <span>↑</span>
                  <span className="font-medium">Live tracking</span>
                </div>
              </div>
            </div>

            {/* Active Campaigns Card */}
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5 hover:border-[#f778ba] transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#f778ba]/10 rounded-md">
                    <Zap className="w-4 h-4 text-[#f778ba]" />
                  </div>
                  <span className="text-sm text-[#7d8590] font-medium">Campaigns</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3fb950] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3fb950]"></span>
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-[#e6edf3] font-mono">4</div>
                <div className="flex items-center gap-1 text-xs text-[#7d8590]">
                  <span>Active</span>
                </div>
              </div>
            </div>

            {/* Modules Card */}
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-5 hover:border-[#a371f7] transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#a371f7]/10 rounded-md">
                    <GitBranch className="w-4 h-4 text-[#a371f7]" />
                  </div>
                  <span className="text-sm text-[#7d8590] font-medium">Modules</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-[#e6edf3] font-mono">{2 + customManagers.length}</div>
                <div className="flex items-center gap-1 text-xs text-[#7d8590]">
                  <span>{customManagers.length} custom</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modules Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#e6edf3]">Modules</h3>
              <button 
                onClick={() => navigate("/create-manager")}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Module</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* E-Governance Module */}
              <div
                onClick={() => navigate("/e-governance")}
                className="group bg-[#0d1117] border border-[#30363d] rounded-lg p-5 hover:border-[#3fb950] hover:bg-[#0d1117]/80 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#3fb950]/10 rounded-lg">
                      <FileText className="w-5 h-5 text-[#3fb950]" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-[#e6edf3] mb-1">E-Governance</h4>
                      <p className="text-xs text-[#7d8590]">Government schemes & scholarships</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#7d8590] group-hover:text-[#e6edf3] group-hover:translate-x-1 transition-all" />
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-[#7d8590]">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Schemes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#7d8590]">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Scholarships</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#3fb950]">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="font-medium">2 Active</span>
                  </div>
                </div>
              </div>

              {/* Training Module */}
              <div
                onClick={() => navigate("/training")}
                className="group bg-[#0d1117] border border-[#30363d] rounded-lg p-5 hover:border-[#f778ba] hover:bg-[#0d1117]/80 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#f778ba]/10 rounded-lg">
                      <Users className="w-5 h-5 text-[#f778ba]" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-[#e6edf3] mb-1">Training</h4>
                      <p className="text-xs text-[#7d8590]">Skill development programs</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#7d8590] group-hover:text-[#e6edf3] group-hover:translate-x-1 transition-all" />
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-[#7d8590]">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Programs</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#7d8590]">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Certificates</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#f778ba]">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="font-medium">2 Active</span>
                  </div>
                </div>
              </div>

              {/* Custom Manager Cards in Grid */}
              {customManagers.map((manager) => (
                <div
                  key={manager.id}
                  onClick={() => navigate(`/manager/${manager.id}`)}
                  className="group bg-[#0d1117] border border-[#30363d] rounded-lg p-5 hover:border-[#ffa657] hover:bg-[#0d1117]/80 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#ffa657]/10 rounded-lg">
                        <Folder className="w-5 h-5 text-[#ffa657]" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-[#e6edf3] mb-1">{manager.name}</h4>
                        <p className="text-xs text-[#7d8590]">{manager.projects.length} {manager.projects.length === 1 ? 'Project' : 'Projects'}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#7d8590] group-hover:text-[#e6edf3] group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-[#7d8590]">
                      <Folder className="w-3.5 h-3.5" />
                      <span>Custom</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#161b22] border-[#30363d] text-[#e6edf3]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#e6edf3]">Delete Manager?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#7d8590]">
              This will permanently delete this manager and all its projects. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#21262d] border-[#30363d] text-[#e6edf3] hover:bg-[#30363d]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteManager}
              className="bg-[#da3633] hover:bg-[#b62324] text-white border-0"
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
