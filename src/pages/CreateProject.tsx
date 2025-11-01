import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, FolderPlus, ExternalLink, Upload, FileText, X, Bell, LogOut, Briefcase } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import SearchBar from "@/components/SearchBar";

const CreateProject = () => {
  const navigate = useNavigate();
  const { managerId } = useParams();
  const { toast } = useToast();
  const [projectName, setProjectName] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [knowledgeBaseFiles, setKnowledgeBaseFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customManagers, setCustomManagers] = useState<Array<{id: string; name: string; projects: any[]}>>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isManager, setIsManager] = useState(false);

  // Check authentication and determine if user is a manager
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success && data.user) {
          setCurrentUser(data.user);
          setIsManager(data.user.role === 'manager');
        } else {
          toast({
            title: "Authentication Required",
            description: "Please login to continue",
            variant: "destructive",
          });
          navigate('/landing');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/landing');
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      localStorage.removeItem('user');
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      
      navigate('/landing');
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'text/plain' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword'
    );

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Only PDF, TXT, and DOC files are allowed",
        variant: "destructive",
      });
    }

    setKnowledgeBaseFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setKnowledgeBaseFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setKnowledgeBaseFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a project name",
        variant: "destructive",
      });
      return;
    }

    if (!sheetUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Google Sheets URL",
        variant: "destructive",
      });
      return;
    }

    // Validate Google Sheets URL
    if (!sheetUrl.includes("docs.google.com/spreadsheets")) {
      toast({
        title: "Error",
        description: "Please enter a valid Google Sheets URL",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Get existing managers
      const managers = JSON.parse(localStorage.getItem("customManagers") || "[]");
      const managerIndex = managers.findIndex((m: any) => m.id === managerId);

      if (managerIndex === -1) {
        toast({
          title: "Error",
          description: "Manager not found",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Create new project
      const projectId = Date.now().toString();
      const newProject = {
        id: projectId,
        name: projectName.trim(),
        sheetUrl: sheetUrl.trim(),
        knowledgeBase: knowledgeBaseFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        })),
        createdAt: new Date().toISOString(),
      };

      // Add project to manager
      managers[managerIndex].projects.push(newProject);
      localStorage.setItem("customManagers", JSON.stringify(managers));

      // Store knowledge base files separately with file contents
      if (knowledgeBaseFiles.length > 0) {
        const kbKey = `kb_${managerId}_${projectId}`;
        const filesWithContent = await Promise.all(
          knowledgeBaseFiles.map(async (file) => {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  uploadedAt: new Date().toISOString(),
                  content: reader.result?.toString().split(',')[1] || '', // Base64 content
                });
              };
              reader.readAsDataURL(file);
            });
          })
        );
        localStorage.setItem(kbKey, JSON.stringify(filesWithContent));
      }

      toast({
        title: "Success!",
        description: `${projectName} project created successfully`,
      });

      setTimeout(() => {
        setIsCreating(false);
        // Navigate to the project detail page
        navigate(`/manager/${managerId}/project/${projectId}`);
      }, 1000);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex">
      {/* Conditionally render sidebar only for non-managers */}
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
            {isManager ? (
              // Manager view - show name and username
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#ffa657] to-[#ff8c00] flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-[#e6edf3]">{currentUser?.fullName || 'Manager'}</h1>
                  <p className="text-xs text-[#7d8590]">@{currentUser?.username}</p>
                </div>
              </div>
            ) : (
              // Admin view - show search bar
              <SearchBar customManagers={customManagers} />
            )}
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#1c2128] rounded-md transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#1f6feb] rounded-full"></span>
            </button>
            {isManager ? (
              // Manager view - show logout button
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="bg-[#21262d] border-[#30363d] text-[#e6edf3] hover:bg-[#30363d] hover:border-[#58a6ff]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            ) : (
              // Admin view - show avatar
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#58a6ff] to-[#1f6feb] flex items-center justify-center text-xs font-semibold">
                CP
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#58a6ff] to-[#1f6feb] flex items-center justify-center">
                <FolderPlus className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Create New Project</h1>
                <p className="text-xs text-[#7d8590]">Add a new project with Google Sheets integration</p>
              </div>
            </div>
            <Button
              onClick={() => navigate(`/manager/${managerId}`)}
              variant="outline"
              className="bg-[#21262d] border-[#30363d] text-[#e6edf3] hover:bg-[#30363d] hover:border-[#58a6ff]"
            >
              Back to Manager
            </Button>
          </div>

          <Card className="p-8 bg-[#161b22] border border-[#30363d] shadow-xl">
          <div className="space-y-8">
            {/* Icon Preview */}
            <div className="flex justify-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 flex items-center justify-center shadow-2xl shadow-blue-500/40">
                  <FolderPlus className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-600 blur-xl opacity-40 -z-10"></div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Project Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Student Records, Inventory Management..."
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="text-lg py-6 border-2 border-slate-300 dark:border-slate-700 focus:border-blue-500"
                  disabled={isCreating}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Choose a descriptive name for your project
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Google Sheets URL
                </label>
                <div className="relative">
                  <Input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    className="text-lg py-6 pr-12 border-2 border-slate-300 dark:border-slate-700 focus:border-blue-500"
                    disabled={isCreating}
                  />
                  <ExternalLink className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
                <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-2">
                    📋 How to get your Google Sheets URL:
                  </p>
                  <ol className="text-xs text-blue-600 dark:text-blue-300 space-y-1 ml-4 list-decimal">
                    <li>Open your Google Sheet</li>
                    <li>Click "File" → "Share" → "Publish to web"</li>
                    <li>Select "Entire Document" and "Comma-separated values (.csv)"</li>
                    <li>Click "Publish" and copy the URL</li>
                  </ol>
                </div>
              </div>

              {/* Knowledge Base Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Knowledge Base (Optional)
                </label>
                
                {/* Drag and Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                      isDragging 
                        ? "bg-blue-100 dark:bg-blue-900/30" 
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}>
                      <Upload className={`w-8 h-8 ${
                        isDragging 
                          ? "text-blue-600 dark:text-blue-400" 
                          : "text-slate-400"
                      }`} />
                    </div>
                    
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {isDragging ? "Drop files here" : "Drag & drop files or click to browse"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Supported: PDF, TXT, DOC, DOCX (Max 10MB each)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uploaded Files List */}
                {knowledgeBaseFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Uploaded Files ({knowledgeBaseFiles.length})
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {knowledgeBaseFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                            className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center flex-shrink-0 transition-colors"
                            title="Remove file"
                          >
                            <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  📚 Upload documents to build a knowledge base for this project (optional)
                </p>
              </div>
            </div>

            {/* Preview */}
            {projectName && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Preview
                </label>
                <div className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                        <FolderPlus className="w-7 h-7 text-white" />
                      </div>
                      <div className="w-3 h-3 rounded-full bg-white/60 animate-pulse"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{projectName}</h2>
                    <p className="text-white/80 text-sm">Custom Project</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-6">
              <Button
                onClick={handleCreateProject}
                disabled={!projectName.trim() || !sheetUrl.trim() || isCreating}
                className="flex-1 py-6 text-lg bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 shadow-lg shadow-blue-500/30"
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
              <Button
                onClick={() => navigate(`/manager/${managerId}`)}
                variant="outline"
                className="px-8 py-6 text-lg border-2"
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

export default CreateProject;
