import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, LogOut, Shield, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/me', {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success && data.user.role === 'manager') {
        setUser(data.user);
        
        // Redirect managers to their specific manager page with ID
        navigate(`/manager/${data.user.id}`);
      } else {
        navigate('/landing');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/landing');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#58a6ff]"></div>
          <p className="text-[#7d8590] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Header */}
      <header className="h-16 border-b border-[#30363d] bg-[#010409] px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a371f7] to-[#8256d0] flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Manager Portal</h1>
            <p className="text-xs text-[#7d8590]">Management Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="text-xs text-[#7d8590]">@{user?.username}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-[#30363d] text-[#e6edf3] hover:bg-[#1c2128]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {user?.fullName}!</h2>
          <p className="text-[#7d8590]">Manager Dashboard - Access your assigned projects and resources</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#0d1117] border-[#30363d] p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#1f6feb]/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#1f6feb]" />
              </div>
              <div>
                <p className="text-sm text-[#7d8590]">Role</p>
                <p className="text-xl font-semibold capitalize">{user?.role}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#0d1117] border-[#30363d] p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#ea4335]/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-[#ea4335]" />
              </div>
              <div>
                <p className="text-sm text-[#7d8590]">Email</p>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#0d1117] border-[#30363d] p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#a371f7]/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#a371f7]" />
              </div>
              <div>
                <p className="text-sm text-[#7d8590]">Username</p>
                <p className="text-sm font-medium">@{user?.username}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-[#0d1117] border-[#30363d] p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#a371f7]/10 flex items-center justify-center">
              <Phone className="w-8 h-8 text-[#a371f7]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Manager Features Coming Soon</h3>
            <p className="text-[#7d8590] mb-6">
              Project management, team collaboration, and reporting tools will be available here
            </p>
            <Button
              onClick={() => window.open('/agent-dashboard', '_blank')}
              className="bg-[#a371f7] hover:bg-[#a371f7]/90"
            >
              <Phone className="w-4 h-4 mr-2" />
              Open Agent Dashboard
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ManagerDashboard;
