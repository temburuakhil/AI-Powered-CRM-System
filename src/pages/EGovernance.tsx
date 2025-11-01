import { useNavigate } from "react-router-dom";
import { GraduationCap, FileText, Bell, ChevronRight, LogOut } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const EGovernance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customManagers, setCustomManagers] = useState<Array<{id: string; name: string; projects: any[]}>>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isManager, setIsManager] = useState(false);

  // Check authentication and role
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/me', {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.user);
        setIsManager(data.user.role === 'manager');
        
        // If manager, check if they have access to this page
        if (data.user.role === 'manager' && data.user.department !== 'egovernance') {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page",
            variant: "destructive",
          });
          navigate('/landing');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

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
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("customManagers");
    if (stored) {
      try { setCustomManagers(JSON.parse(stored)); } catch {}
    }
  }, []);

  const handleDeleteManager = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customManagers.filter(m => m.id !== id);
    setCustomManagers(updated);
    localStorage.setItem("customManagers", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex">
      {!isManager && (
        <Sidebar 
          customManagers={customManagers} 
          onDeleteManager={handleDeleteManager}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}
      <main className={`flex-1 transition-all duration-300 ${!isManager && (isSidebarCollapsed ? 'ml-16' : 'ml-64')}`}>
        {/* Top Bar */}
        <header className="h-16 border-b border-[#30363d] bg-[#010409] px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            {!isManager && <SearchBar customManagers={customManagers} />}
            {isManager && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#3fb950] to-[#2ea043] flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-semibold">E-Governance Manager</h1>
                  <p className="text-xs text-[#7d8590]">{currentUser?.fullName}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#1c2128] rounded-md transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#1f6feb] rounded-full"></span>
            </button>
            {isManager ? (
              <Button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#e6edf3] bg-[#0d1117] border border-[#30363d] rounded-md hover:border-[#58a6ff] hover:bg-[#1c2128] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#58a6ff] to-[#1f6feb] flex items-center justify-center text-xs font-semibold">
                EG
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#e6edf3] mb-1">E-Governance</h2>
            <p className="text-sm text-[#7d8590]">Government schemes and scholarship management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Schemes */}
            <div
              onClick={() => navigate("/schemes")}
              className="group bg-[#0d1117] border border-[#30363d] rounded-lg p-5 hover:border-[#3fb950] hover:bg-[#0d1117]/80 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#3fb950]/10 rounded-lg">
                    <FileText className="w-5 h-5 text-[#3fb950]" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-[#e6edf3] mb-1">Government Schemes</h4>
                    <p className="text-xs text-[#7d8590]">Schemes and services</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#7d8590] group-hover:text-[#e6edf3] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-[#7d8590]">Explore schemes and manage submissions</p>
            </div>

            {/* Scholarships */}
            <div
              onClick={() => navigate("/scholarships")}
              className="group bg-[#0d1117] border border-[#30363d] rounded-lg p-5 hover:border-[#a371f7] hover:bg-[#0d1117]/80 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#a371f7]/10 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-[#a371f7]" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-[#e6edf3] mb-1">Scholarship Programs</h4>
                    <p className="text-xs text-[#7d8590]">Applications and disbursements</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#7d8590] group-hover:text-[#e6edf3] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-[#7d8590]">Track progress and manage actions</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EGovernance;
