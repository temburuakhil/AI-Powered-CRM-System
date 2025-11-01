import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Plus,
  FolderKanban,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Phone,
} from "lucide-react";
import React, { useState } from "react";

type SidebarProps = {
  customManagers: { id: string; name: string; projects: any[] }[];
  onDeleteManager: (id: string, e: React.MouseEvent) => void;
  isCollapsed: boolean;
  onToggle: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ customManagers, onDeleteManager, isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEGovExpanded, setIsEGovExpanded] = useState(true);

  // Helper function to check if route is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} border-r border-[#30363d] bg-[#010409] flex flex-col fixed h-full transition-all duration-300 ease-in-out`}>
      {/* Logo */}
      <div className="p-6 border-b border-[#30363d] flex items-center justify-between">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#58a6ff] to-[#1f6feb] flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-base font-semibold text-[#e6edf3]">Admin Portal</h1>
              <p className="text-xs text-[#7d8590]">Management Hub</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#1c2128] border border-[#30363d] rounded-full flex items-center justify-center text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#30363d] transition-colors z-50"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {!isCollapsed && <div className="px-3 py-2 text-xs font-semibold text-[#7d8590] uppercase tracking-wider">Main</div>}
        <button
          onClick={() => navigate("/")}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive('/') 
              ? 'text-[#e6edf3] bg-[#1c2128] font-medium' 
              : 'text-[#7d8590] hover:bg-[#1c2128] hover:text-[#e6edf3]'
          }`}
          title="Dashboard"
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className={isActive('/') ? 'font-medium' : ''}>Dashboard</span>}
        </button>

        {!isCollapsed && <div className="px-3 py-2 text-xs font-semibold text-[#7d8590] uppercase tracking-wider mt-4">Modules</div>}
        
        {/* E-Governance with Subsections */}
        <div>
          <button
            onClick={() => {
              if (isCollapsed) {
                navigate("/e-governance");
              } else {
                setIsEGovExpanded(!isEGovExpanded);
              }
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
              isActive('/e-governance') || isActive('/schemes') || isActive('/scholarships')
                ? 'text-[#e6edf3] bg-[#1c2128] font-medium' 
                : 'text-[#7d8590] hover:bg-[#1c2128] hover:text-[#e6edf3]'
            }`}
            title="E-Governance"
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">E-Governance</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isEGovExpanded ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
          
          {/* E-Governance Subsections */}
          {!isCollapsed && isEGovExpanded && (
            <div className="ml-7 mt-1 space-y-1">
              <button
                onClick={() => navigate("/schemes")}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isActive('/schemes')
                    ? 'text-[#e6edf3] bg-[#1c2128] font-medium' 
                    : 'text-[#7d8590] hover:bg-[#1c2128] hover:text-[#e6edf3]'
                }`}
                title="Government Schemes"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isActive('/schemes') ? 'bg-[#3fb950]' : 'bg-[#7d8590]'}`}></div>
                <span>Government Schemes</span>
              </button>
              <button
                onClick={() => navigate("/scholarships")}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isActive('/scholarships')
                    ? 'text-[#e6edf3] bg-[#1c2128] font-medium' 
                    : 'text-[#7d8590] hover:bg-[#1c2128] hover:text-[#e6edf3]'
                }`}
                title="Scholarships"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isActive('/scholarships') ? 'bg-[#3fb950]' : 'bg-[#7d8590]'}`}></div>
                <span>Scholarships</span>
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={() => navigate("/training")}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive('/training')
              ? 'text-[#e6edf3] bg-[#1c2128] font-medium' 
              : 'text-[#7d8590] hover:bg-[#1c2128] hover:text-[#e6edf3]'
          }`}
          title="Training"
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Training</span>}
        </button>

        <button
          onClick={() => window.open('/agent-dashboard', '_blank')}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
            isActive('/agent-dashboard')
              ? 'text-[#e6edf3] bg-[#1c2128] font-medium' 
              : 'text-[#7d8590] hover:bg-[#1c2128] hover:text-[#e6edf3]'
          }`}
          title="Agent Dashboard (Opens in new tab)"
        >
          <Phone className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Agent Dashboard</span>}
        </button>

        {customManagers.length > 0 && (
          <>
            {!isCollapsed && (
              <div className="px-3 py-2 text-xs font-semibold text-[#7d8590] uppercase tracking-wider mt-4">
                Custom Managers
              </div>
            )}
            {customManagers.map((manager) => (
              <div
                key={manager.id}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors group cursor-pointer ${
                  isActive(`/manager/${manager.id}`)
                    ? 'text-[#e6edf3] bg-[#1c2128] font-medium' 
                    : 'text-[#7d8590] hover:bg-[#1c2128] hover:text-[#e6edf3]'
                }`}
                onClick={() => navigate(`/manager/${manager.id}`)}
                title={manager.name}
              >
                <FolderKanban className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{manager.name}</span>
                    <button
                      onClick={(e) => onDeleteManager(manager.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-600/20 rounded"
                      title="Delete Manager"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                  </>
                )}
              </div>
            ))}
          </>
        )}

        <button
          onClick={() => navigate("/create-manager")}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#58a6ff] rounded-md hover:bg-[#1c2128] transition-colors mt-2"
          title="New Manager"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>New Manager</span>}
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
