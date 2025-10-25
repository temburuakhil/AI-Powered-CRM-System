import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, FileSpreadsheet, FolderOpen, FileText } from "lucide-react";
import Papa from "papaparse";
import { DataTable } from "@/components/DataTable";
import { EmailCampaign } from "@/components/EmailCampaign";
import { VoiceCampaign } from "@/components/VoiceCampaign";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  sheetUrl: string;
  knowledgeBase?: Array<{
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
  }>;
  createdAt: string;
}

interface Manager {
  id: string;
  name: string;
  createdAt: string;
  projects: Project[];
}

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { managerId, projectId } = useParams();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [manager, setManager] = useState<Manager | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [knowledgeBaseFiles, setKnowledgeBaseFiles] = useState<any[]>([]);

  useEffect(() => {
    // Load project data from localStorage
    const managers = JSON.parse(localStorage.getItem("customManagers") || "[]");
    const foundManager = managers.find((m: Manager) => m.id === managerId);
    
    if (foundManager) {
      setManager(foundManager);
      const foundProject = foundManager.projects.find((p: Project) => p.id === projectId);
      
      if (foundProject) {
        setProject(foundProject);
        
        // Load knowledge base files from localStorage
        const kbKey = `kb_${managerId}_${projectId}`;
        const storedKB = localStorage.getItem(kbKey);
        if (storedKB) {
          setKnowledgeBaseFiles(JSON.parse(storedKB));
        }
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [managerId, projectId, navigate]);

  const fetchSheetData = async () => {
    if (!project?.sheetUrl) return;

    setIsLoading(true);
    try {
      // Extract sheet ID and GID from the URL
      const sheetId = project.sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      let gid = project.sheetUrl.match(/[#&]gid=([0-9]+)/)?.[1] || "0";

      if (!sheetId) {
        console.error("Could not extract sheet ID from URL");
        setIsLoading(false);
        return;
      }

      // Construct CSV export URL
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

      Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setData(results.data);
          }
          setIsLoading(false);
          setLastRefresh(new Date());
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Error fetching sheet data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (project) {
      fetchSheetData();
      // Auto-refresh every 5 seconds
      const interval = setInterval(fetchSheetData, 5000);
      return () => clearInterval(interval);
    }
  }, [project]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleStatusUpdate = async (updatedData: any[]) => {
    setData(updatedData);
    
    // Note: This updates local state only
    // In production, you would also update the Google Sheet via API
    toast({
      title: "Status Updated",
      description: "Email statuses have been updated locally. Note: Google Sheets will not be updated automatically.",
    });
  };

  const downloadKnowledgeBaseFile = (fileName: string) => {
    const kbKey = `kb_${managerId}_${projectId}`;
    const storedKB = localStorage.getItem(kbKey);
    
    if (storedKB) {
      const files = JSON.parse(storedKB);
      const file = files.find((f: any) => f.name === fileName);
      
      if (file && file.content) {
        // Create a blob from the base64 content
        const byteCharacters = atob(file.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file.type });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    }
  };

  if (!project || !manager) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* First Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/manager/${managerId}`)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <FileSpreadsheet className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-teal-600 blur-md opacity-40 -z-10"></div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                      {project.name}
                    </h1>
                    <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{manager.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Project Dashboard - Data from Google Sheets
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/60 dark:border-blue-800/60 shadow-sm">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></div>
                </div>
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Live</span>
              </div>
            </div>

            {/* Second Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/60 dark:border-blue-800/60">
                  <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                    {data.length} Records
                  </span>
                </div>
                
                {knowledgeBaseFiles.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/60 dark:border-purple-800/60">
                    <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                      {knowledgeBaseFiles.length} Knowledge Base {knowledgeBaseFiles.length === 1 ? 'File' : 'Files'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchSheetData}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow"
                >
                  <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Refresh</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {lastRefresh.toLocaleTimeString()}
                    </div>
                  </div>
                </button>
                
                {/* Campaign Buttons */}
                {data.length > 0 && (
                  <div className="flex items-center gap-2">
                    {/* Email Campaign */}
                    <EmailCampaign
                      data={data}
                      statusColumn={Object.keys(data[0] || {}).find(key => 
                        key.toLowerCase().includes('status')
                      ) || "Status"}
                      emailColumn={Object.keys(data[0] || {}).find(key => 
                        key.toLowerCase().includes('email')
                      ) || "Email"}
                      onStatusUpdate={handleStatusUpdate}
                      projectName={project?.name}
                      knowledgeBaseFiles={knowledgeBaseFiles}
                      sheetUrl={project?.sheetUrl}
                    />
                    
                    {/* Voice Campaign */}
                    <VoiceCampaign
                      data={data}
                      phoneColumn={Object.keys(data[0] || {}).find(key => 
                        key.toLowerCase().includes('phone') || key.toLowerCase().includes('mobile')
                      ) || "Phone"}
                      statusColumn={Object.keys(data[0] || {}).find(key => 
                        key.toLowerCase().includes('status')
                      ) || "Status"}
                      onStatusUpdate={handleStatusUpdate}
                      projectName={project?.name}
                      knowledgeBaseFiles={knowledgeBaseFiles}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <div className="space-y-6">
          {/* Knowledge Base Section */}
          {knowledgeBaseFiles.length > 0 && (
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border-2 border-slate-200/60 dark:border-slate-800/60 shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Knowledge Base</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Uploaded documentation and resources</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {knowledgeBaseFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => downloadKnowledgeBaseFile(file.name)}
                    className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-purple-700 dark:group-hover:text-purple-400">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border-2 border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden">
            {isLoading && data.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Loading data...</p>
                </div>
              </div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <FileSpreadsheet className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium">No data available</p>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                    Check your Google Sheets URL and make sure it's published to the web
                  </p>
                </div>
              </div>
            ) : (
              <DataTable data={data} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
