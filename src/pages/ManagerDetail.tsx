import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Briefcase, FolderOpen, Trash2, Bell, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/Sidebar";
import SearchBar from "@/components/SearchBar";
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

interface Project {
  id: string;
  name: string;
  sheetUrl: string;
  createdAt: string;
}

interface Manager {
  id: string;
  name: string;
  createdAt: string;
  projects: Project[];
}

const ManagerDetail = () => {
  const navigate = useNavigate();
  const { managerId } = useParams();
  const { toast } = useToast();
  const [manager, setManager] = useState<Manager | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [customManagers, setCustomManagers] = useState<Array<{id: string; name: string; projects: any[]}>>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Load manager data from localStorage
    const managers = JSON.parse(localStorage.getItem("customManagers") || "[]");
    setCustomManagers(managers);
    const foundManager = managers.find((m: Manager) => m.id === managerId);
    
    if (foundManager) {
      setManager(foundManager);
    } else {
      navigate("/");
    }
  }, [managerId, navigate]);

  const handleDeleteManager = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customManagers.filter(m => m.id !== id);
    setCustomManagers(updated);
    localStorage.setItem("customManagers", JSON.stringify(updated));
  };

  const handleDeleteProject = (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete({ id: projectId, name: projectName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProject = () => {
    if (!projectToDelete || !manager) return;

    const managers = JSON.parse(localStorage.getItem("customManagers") || "[]");
    const managerIndex = managers.findIndex((m: Manager) => m.id === managerId);
    
    if (managerIndex !== -1) {
      managers[managerIndex].projects = managers[managerIndex].projects.filter(
        (p: Project) => p.id !== projectToDelete.id
      );
      localStorage.setItem("customManagers", JSON.stringify(managers));
      setManager(managers[managerIndex]);
      
      toast({
        title: "Project Deleted",
        description: `"${projectToDelete.name}" has been removed successfully.`,
      });
    }
    
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  if (!manager) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium mt-4">Loading...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1c2128] border border-[#30363d]">
              <Folder className="w-4 h-4 text-[#ffa657]" />
              <span className="text-sm font-medium text-[#e6edf3]">
                {manager.projects.length} Project{manager.projects.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button className="relative p-2 text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#1c2128] rounded-md transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#1f6feb] rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffa657] to-[#ff8c00] flex items-center justify-center text-xs font-semibold">
              {manager.name.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-[1800px] mx-auto p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#ffa657] to-[#ff8c00] flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{manager.name}</h1>
                <p className="text-xs text-[#7d8590]">Manager Profile - Projects Dashboard</p>
              </div>
            </div>
          </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Project Card */}
          <button
            onClick={() => navigate(`/manager/${managerId}/create-project`)}
            className="group bg-[#0d1117] border-2 border-dashed border-[#30363d] hover:border-[#58a6ff] rounded-lg p-8 transition-all duration-300 min-h-[200px] flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-[#238636] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-bold text-[#e6edf3] mb-2">Create New Project</h2>
            <p className="text-[#7d8590] text-sm">Add a new project with Google Sheets</p>
          </button>

          {/* Existing Projects */}
          {manager.projects.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-2 flex items-center justify-center min-h-[200px]">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-[#161b22] flex items-center justify-center">
                  <FolderOpen className="w-8 h-8 text-[#7d8590]" />
                </div>
                <h3 className="text-lg font-semibold text-[#e6edf3] mb-2">No Projects Yet</h3>
                <p className="text-sm text-[#7d8590]">Create your first project to get started</p>
              </div>
            </div>
          ) : (
            manager.projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/manager/${managerId}/project/${project.id}`)}
                className="group relative bg-[#0d1117] border border-[#30363d] rounded-lg p-5 hover:border-[#58a6ff] hover:bg-[#0d1117]/80 transition-all cursor-pointer min-h-[200px] flex flex-col"
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-md bg-[#da3633]/10 hover:bg-[#da3633]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4 text-[#da3633]" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-[#58a6ff]/10 rounded-lg">
                    <FolderOpen className="w-5 h-5 text-[#58a6ff]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-[#e6edf3] mb-1">{project.name}</h4>
                    <p className="text-xs text-[#7d8590]">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#161b22] border-[#30363d] text-[#e6edf3]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#e6edf3]">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#7d8590]">
              This will permanently delete "{projectToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#21262d] border-[#30363d] text-[#e6edf3] hover:bg-[#30363d]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
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

export default ManagerDetail;
