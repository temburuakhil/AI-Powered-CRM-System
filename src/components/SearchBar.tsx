import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";

interface SearchBarProps {
  customManagers?: { id: string; name: string; projects: any[] }[];
}

const SearchBar: React.FC<SearchBarProps> = ({ customManagers = [] }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Define searchable routes
  const routes = [
    { name: "Dashboard", path: "/admin", keywords: ["home", "dashboard", "main"] },
    { name: "E-Governance", path: "/e-governance", keywords: ["e-governance", "governance", "schemes", "scholarships"] },
    { name: "Training", path: "/training", keywords: ["training", "courses", "skill", "development"] },
    { name: "Schemes", path: "/schemes", keywords: ["schemes", "government"] },
    { name: "Scholarships", path: "/scholarships", keywords: ["scholarships", "education"] },
    { name: "Registration Details", path: "/registration-details", keywords: ["registration", "details"] },
    { name: "Transcripts", path: "/transcripts", keywords: ["transcripts", "records"] },
    { name: "Feedback", path: "/feedback", keywords: ["feedback", "reviews"] },
    { name: "Create Manager", path: "/create-manager", keywords: ["create", "manager", "new"] },
    ...customManagers.map(m => ({
      name: m.name,
      path: `/manager/${m.id}`,
      keywords: [m.name.toLowerCase(), "manager", "custom"]
    }))
  ];

  // Filter routes based on search query
  const filteredRoutes = searchQuery.trim()
    ? routes.filter(route => {
        const query = searchQuery.toLowerCase();
        return (
          route.name.toLowerCase().includes(query) ||
          route.path.toLowerCase().includes(query) ||
          route.keywords.some(keyword => keyword.includes(query))
        );
      })
    : [];

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(true);
  };

  // Handle route selection
  const handleRouteSelect = (path: string) => {
    navigate(path);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSearchResults(false);
      setSearchQuery("");
    } else if (e.key === 'Enter' && filteredRoutes.length > 0) {
      handleRouteSelect(filteredRoutes[0].path);
    }
  };

  return (
    <div className="relative flex-1 search-container">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8590]" />
      <input
        type="text"
        placeholder="Search or jump to..."
        value={searchQuery}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        onFocus={() => searchQuery && setShowSearchResults(true)}
        className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#e6edf3] placeholder-[#7d8590] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
      />
      {/* Search Results Dropdown */}
      {showSearchResults && filteredRoutes.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#161b22] border border-[#30363d] rounded-md shadow-lg max-h-80 overflow-y-auto z-50">
          {filteredRoutes.map((route, index) => (
            <button
              key={index}
              onClick={() => handleRouteSelect(route.path)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#1c2128] transition-colors border-b border-[#30363d] last:border-b-0"
            >
              <Search className="w-4 h-4 text-[#7d8590]" />
              <div className="flex-1">
                <div className="text-sm font-medium text-[#e6edf3]">{route.name}</div>
                <div className="text-xs text-[#7d8590]">{route.path}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#7d8590]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
