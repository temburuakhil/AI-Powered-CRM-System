import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Briefcase, FolderOpen, Trash2 } from "lucide-react";
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

  useEffect(() => {
    // Load manager data from localStorage
    const managers = JSON.parse(localStorage.getItem("customManagers") || "[]");
    const foundManager = managers.find((m: Manager) => m.id === managerId);
    
    if (foundManager) {
      setManager(foundManager);
    } else {
      navigate("/");
    }
  }, [managerId, navigate]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-600 blur-md opacity-40 -z-10"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                  {manager.name}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manager Profile - Projects Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200/60 dark:border-indigo-800/60 shadow-sm">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></div>
              </div>
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                {manager.projects.length} Project{manager.projects.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Project Card */}
          <button
            onClick={() => navigate(`/manager/${managerId}/create-project`)}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 min-h-[280px] flex flex-col items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Create New Project</h2>
              <p className="text-white/80 text-sm">Add a new project with Google Sheets</p>
            </div>

            <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-white/40 animate-pulse"></div>
          </button>

          {/* Existing Projects */}
          {manager.projects.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-2 flex items-center justify-center min-h-[280px]">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <FolderOpen className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Projects Yet</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Create your first project to get started</p>
              </div>
            </div>
          ) : (
            manager.projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/manager/${managerId}/project/${project.id}`)}
                className="group relative cursor-pointer transform transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-3xl p-8 shadow-2xl min-h-[280px] flex flex-col">
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>

                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                      <FolderOpen className="w-7 h-7 text-white" />
                    </div>
                    <div className="w-3 h-3 rounded-full bg-white/60 animate-pulse"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2 flex-grow">{project.name}</h2>
                  <p className="text-white/80 text-sm">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{projectToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
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

export default ManagerDetail;
