import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Briefcase, Bell, FolderPlus } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import SearchBar from "@/components/SearchBar";

const CreateManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [managerName, setManagerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [customManagers, setCustomManagers] = useState<Array<{id: string; name: string; projects: any[]}>>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Load custom managers from localStorage
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

  const handleCreateManager = () => {
    if (!managerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a manager name",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    // Get existing managers from localStorage
    const existingManagers = JSON.parse(localStorage.getItem("customManagers") || "[]");

    // Create new manager object
    const newManager = {
      id: Date.now().toString(),
      name: managerName.trim(),
      createdAt: new Date().toISOString(),
      projects: [],
    };

    // Add to managers list
    const updatedManagers = [...existingManagers, newManager];
    localStorage.setItem("customManagers", JSON.stringify(updatedManagers));

    toast({
      title: "Success!",
      description: `${managerName} manager created successfully`,
    });

    setTimeout(() => {
      setIsCreating(false);
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex">
      <Sidebar 
        customManagers={customManagers} 
        onDeleteManager={handleDeleteManager}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Top Bar */}
        <header className="h-16 border-b border-[#30363d] bg-[#010409] px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <SearchBar customManagers={customManagers} />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#1c2128] rounded-md transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#1f6feb] rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#58a6ff] to-[#1f6feb] flex items-center justify-center text-xs font-semibold">
              CM
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-8 py-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#ffa657] to-[#ff8c00] flex items-center justify-center">
              <FolderPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Create New Manager</h1>
              <p className="text-xs text-[#7d8590]">Add a new service manager to your admin portal</p>
            </div>
          </div>
        <Card className="p-8 bg-[#161b22] border border-[#30363d] shadow-xl">
          <div className="space-y-8">
            {/* Icon Preview */}
            <div className="flex justify-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#ffa657] to-[#ff8c00] flex items-center justify-center shadow-2xl shadow-orange-500/40">
                  <Briefcase className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ffa657] to-[#ff8c00] blur-xl opacity-40 -z-10"></div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#e6edf3] mb-2">
                  Manager / Service Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Healthcare, Education, Transportation..."
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="text-lg py-6 bg-[#0d1117] border border-[#30363d] text-[#e6edf3] placeholder-[#7d8590] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
                  disabled={isCreating}
                />
                <p className="text-xs text-[#7d8590] mt-2">
                  This will appear as a card in your admin portal
                </p>
              </div>
            </div>

            {/* Preview */}
            {managerName && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[#e6edf3]">
                  Preview
                </label>
                <div className="group bg-[#0d1117] border border-[#30363d] rounded-lg p-5 hover:border-[#ffa657] hover:bg-[#0d1117]/80 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#ffa657]/10 rounded-lg">
                        <Briefcase className="w-5 h-5 text-[#ffa657]" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-[#e6edf3] mb-1">{managerName}</h4>
                        <p className="text-xs text-[#7d8590]">0 Projects</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-[#7d8590]">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Custom</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-6">
              <Button
                onClick={handleCreateManager}
                disabled={!managerName.trim() || isCreating}
                className="flex-1 py-6 text-lg bg-[#238636] hover:bg-[#2ea043] text-white shadow-lg"
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Manager Profile
                  </>
                )}
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="px-8 py-6 text-lg bg-[#21262d] border border-[#30363d] text-[#e6edf3] hover:bg-[#30363d] hover:border-[#58a6ff]"
                disabled={isCreating}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateManager;
