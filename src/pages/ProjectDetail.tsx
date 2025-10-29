import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, FileSpreadsheet, FolderOpen, FileText, Trello } from "lucide-react";
import Papa from "papaparse";
import { DataTable } from "@/components/DataTable";
import { EmailCampaign } from "@/components/EmailCampaign";
import { VoiceCampaign } from "@/components/VoiceCampaign";
import { KanbanBoard } from "@/components/KanbanBoard";
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
  const [isKanbanOpen, setIsKanbanOpen] = useState(false);

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
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#58a6ff]"></div>
          <p className="text-[#7d8590] font-medium mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Header */}
      <div className="border-b border-[#30363d] bg-[#010409] sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* First Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/manager/${managerId}`)}
                  className="p-2 rounded-md hover:bg-[#1c2128] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[#7d8590] hover:text-[#e6edf3]" />
                </button>
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#58a6ff] to-[#1f6feb] flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold text-[#e6edf3]">
                      {project.name}
                    </h1>
                    <span className="text-xs text-[#7d8590]">•</span>
                    <span className="text-xs text-[#7d8590]">{manager.name}</span>
                  </div>
                  <p className="text-xs text-[#7d8590] mt-0.5">
                    Project Dashboard - Data from Google Sheets
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1f6feb]/10 border border-[#1f6feb]/30">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3fb950] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3fb950]"></span>
                </div>
                <span className="text-xs font-semibold text-[#58a6ff]">Live</span>
              </div>
            </div>

            {/* Second Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1c2128] border border-[#30363d]">
                  <FolderOpen className="w-4 h-4 text-[#58a6ff]" />
                  <span className="text-sm font-medium text-[#e6edf3]">
                    {data.length} Records
                  </span>
                </div>
                
                {knowledgeBaseFiles.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1c2128] border border-[#30363d]">
                    <FileText className="w-4 h-4 text-[#a371f7]" />
                    <span className="text-sm font-medium text-[#e6edf3]">
                      {knowledgeBaseFiles.length} Knowledge Base {knowledgeBaseFiles.length === 1 ? 'File' : 'Files'}
                    </span>
                  </div>
                )}

                {/* Kanban Board Button */}
                <button
                  onClick={() => setIsKanbanOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1c2128] border border-[#30363d] hover:border-[#58a6ff] hover:bg-[#0d1117] transition-all group"
                >
                  <Trello className="w-4 h-4 text-[#58a6ff] group-hover:text-[#79c0ff]" />
                  <span className="text-sm font-medium text-[#e6edf3] group-hover:text-[#58a6ff]">
                    Kanban Board
                  </span>
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchSheetData}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#0d1117] border border-[#30363d] hover:border-[#58a6ff] hover:bg-[#1c2128] transition-all"
                >
                  <RefreshCw className="w-4 h-4 text-[#7d8590]" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-[#e6edf3]">Refresh</div>
                    <div className="text-xs text-[#7d8590]">
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
      <div className="max-w-[1800px] mx-auto px-8 py-8">
        <div className="space-y-6">
          {/* Knowledge Base Section */}
          {knowledgeBaseFiles.length > 0 && (
            <div className="bg-[#0d1117] rounded-lg border border-[#30363d] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#a371f7]/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#a371f7]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#e6edf3]">Knowledge Base</h2>
                  <p className="text-xs text-[#7d8590]">Uploaded documentation and resources</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {knowledgeBaseFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => downloadKnowledgeBaseFile(file.name)}
                    className="flex items-center gap-3 p-4 bg-[#0d1117] border border-[#30363d] rounded-lg hover:border-[#a371f7] hover:bg-[#1c2128] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#a371f7]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#a371f7]/20 transition-colors">
                      <FileText className="w-5 h-5 text-[#a371f7]" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-[#e6edf3] truncate group-hover:text-[#a371f7]">
                        {file.name}
                      </p>
                      <p className="text-xs text-[#7d8590]">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Data Table */}
          <div>
            {isLoading && data.length === 0 ? (
              <div className="flex items-center justify-center py-20 bg-[#0d1117] rounded-lg border border-[#30363d]">
                <div className="text-center">
                  <RefreshCw className="w-12 h-12 text-[#58a6ff] animate-spin mx-auto mb-4" />
                  <p className="text-[#e6edf3] font-medium">Loading data...</p>
                </div>
              </div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center py-20 bg-[#0d1117] rounded-lg border border-[#30363d]">
                <div className="text-center">
                  <FileSpreadsheet className="w-16 h-16 text-[#7d8590] mx-auto mb-4" />
                  <p className="text-[#e6edf3] font-medium">No data available</p>
                  <p className="text-sm text-[#7d8590] mt-2">
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

      {/* Kanban Board Modal */}
      <KanbanBoard
        projectId={projectId || ""}
        managerId={managerId || ""}
        isOpen={isKanbanOpen}
        onClose={() => setIsKanbanOpen(false)}
        data={data}
      />
    </div>
  );
};

export default ProjectDetail;
