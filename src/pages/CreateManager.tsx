import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Briefcase, Bell, FolderPlus, Eye, EyeOff } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import SearchBar from "@/components/SearchBar";

const CreateManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [managerName, setManagerName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const handleCreateManager = async () => {
    // Validation
    if (!managerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a manager name",
        variant: "destructive",
      });
      return;
    }

    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address (e.g., user@example.com)",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    if (!password.trim() || password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    // Check for capital letter
    if (!/[A-Z]/.test(password)) {
      toast({
        title: "Weak Password",
        description: "Password must contain at least one uppercase letter",
        variant: "destructive",
      });
      return;
    }

    // Check for number
    if (!/[0-9]/.test(password)) {
      toast({
        title: "Weak Password",
        description: "Password must contain at least one number",
        variant: "destructive",
      });
      return;
    }

    // Check for symbol
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      toast({
        title: "Weak Password",
        description: "Password must contain at least one special character (!@#$%^&*...)",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates in localStorage
    const existingManagers = JSON.parse(localStorage.getItem("customManagers") || "[]");
    
    // Check duplicate name
    const duplicateName = existingManagers.find(
      (m: any) => m.name.toLowerCase() === managerName.trim().toLowerCase()
    );
    if (duplicateName) {
      toast({
        title: "Duplicate Manager Name",
        description: "A manager with this name already exists. Please choose a different name.",
        variant: "destructive",
      });
      return;
    }

    // Check duplicate username
    const duplicateUsername = existingManagers.find(
      (m: any) => m.username?.toLowerCase() === username.trim().toLowerCase()
    );
    if (duplicateUsername) {
      toast({
        title: "Duplicate Username",
        description: "This username is already taken. Please choose a different username.",
        variant: "destructive",
      });
      return;
    }

    // Check duplicate email
    const duplicateEmail = existingManagers.find(
      (m: any) => m.email?.toLowerCase() === email.trim().toLowerCase()
    );
    if (duplicateEmail) {
      toast({
        title: "Duplicate Email",
        description: "This email is already registered. Please use a different email address.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create manager in database via backend API
      const response = await fetch('http://localhost:3001/api/auth/create-manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password,
          fullName: managerName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create manager');
      }

      // Send credentials email via backend
      try {
        await fetch('http://localhost:3001/api/send-manager-credentials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            fullName: managerName.trim(),
            username: username.trim(),
            password: password,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the whole operation if email fails
      }

      // Get existing managers from localStorage
      const existingManagers = JSON.parse(localStorage.getItem("customManagers") || "[]");

      // Create new manager object for localStorage
      const newManager = {
        id: data.manager.id || Date.now().toString(),
        name: managerName.trim(),
        username: username.trim(),
        email: email.trim(),
        createdAt: new Date().toISOString(),
        projects: [],
      };

      // Add to managers list
      const updatedManagers = [...existingManagers, newManager];
      localStorage.setItem("customManagers", JSON.stringify(updatedManagers));

      toast({
        title: "Success!",
        description: `${managerName} manager created successfully. Credentials sent to ${email}`,
      });

      setTimeout(() => {
        setIsCreating(false);
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error('Create manager error:', error);
      setIsCreating(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create manager",
        variant: "destructive",
      });
    }
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

              <div>
                <label className="block text-sm font-semibold text-[#e6edf3] mb-2">
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="e.g., manager_healthcare"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-lg py-6 bg-[#0d1117] border border-[#30363d] text-[#e6edf3] placeholder-[#7d8590] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
                  disabled={isCreating}
                />
                <p className="text-xs text-[#7d8590] mt-2">
                  Used for login authentication
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#e6edf3] mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="manager@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-lg py-6 bg-[#0d1117] border border-[#30363d] text-[#e6edf3] placeholder-[#7d8590] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
                  disabled={isCreating}
                />
                <p className="text-xs text-[#7d8590] mt-2">
                  Credentials will be sent to this email
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#e6edf3] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="e.g., Admin@123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-lg py-6 pr-12 bg-[#0d1117] border border-[#30363d] text-[#e6edf3] placeholder-[#7d8590] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]"
                    disabled={isCreating}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7d8590] hover:text-[#58a6ff] transition-colors focus:outline-none"
                    disabled={isCreating}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#7d8590] mt-2">
                  Must include: uppercase letter, number, special character, min 6 characters
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
                disabled={!managerName.trim() || !username.trim() || !email.trim() || !password.trim() || isCreating}
                className="flex-1 py-6 text-lg bg-[#238636] hover:bg-[#2ea043] text-white shadow-lg"
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating & Sending Email...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Manager & Send Credentials
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
