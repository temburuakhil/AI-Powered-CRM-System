import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Shield, Users, ArrowRight, Lock, User as UserIcon, Zap, TrendingUp, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.fullName}!`,
        });

        // Redirect based on role returned from backend
          if (data.user.role === 'admin') {
            navigate('/');
          } else if (data.user.role === 'manager') {
            if (data.user.department === 'training') {
              navigate('/training');
            } else if (data.user.department === 'egovernance') {
              navigate('/e-governance');
            } else {
              navigate(`/manager/${data.user.id}`);
            }
          }
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTAwIDAgTCAwIDAgMCAxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <Card className="w-full max-w-6xl bg-slate-900/90 backdrop-blur-xl border-slate-700/50 overflow-hidden relative z-10 shadow-2xl">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left Side - Branding */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-12 lg:p-16 flex flex-col justify-center text-white relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-20 w-40 h-40 border border-white rounded-full"></div>
              <div className="absolute top-40 left-40 w-24 h-24 border border-white rounded-full"></div>
              <div className="absolute bottom-20 right-20 w-56 h-56 border border-white rounded-full"></div>
              <div className="absolute bottom-40 right-40 w-32 h-32 border border-white rounded-full"></div>
            </div>
            
            <div className="relative z-10 space-y-8">
              {/* Logo */}
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-wide">CRM Portal</span>
              </div>
              
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                  Enterprise<br />Management<br />System
                </h1>
                <p className="text-blue-100 text-lg lg:text-xl leading-relaxed max-w-md">
                  Streamline your operations with our secure, role-based customer relationship management platform
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Secure Authentication</h3>
                    <p className="text-blue-100 text-sm">Bank-level security protocols</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Role Management</h3>
                    <p className="text-blue-100 text-sm">Granular access control</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Data Protection</h3>
                    <p className="text-blue-100 text-sm">End-to-end encryption</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex items-center gap-6 text-white/60">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span className="text-sm">Real-time Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">Analytics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-12 lg:p-16 bg-slate-800/50 backdrop-blur-sm">
            <div className="mb-10">
              <h3 className="text-3xl font-bold text-white mb-3">Sign In</h3>
              <p className="text-slate-300 text-lg">Access your dashboard securely</p>
            </div>

            {/* Role selection removed: role is assigned server-side for created managers */}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="username" className="text-white font-semibold text-base">
                  Username
                </Label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="username"
                    type="text"
                    placeholder={'Enter username'}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="pl-12 bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-14 text-base rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-white font-semibold text-base">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-12 bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-14 text-base rounded-xl"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={`w-full h-14 text-base font-semibold rounded-xl shadow-lg transition-all duration-200 mt-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-500/30 hover:shadow-blue-500/50`}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-700/50">
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Shield className="w-4 h-4" />
                <p className="text-sm">Secured with enterprise-grade encryption</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Landing;
