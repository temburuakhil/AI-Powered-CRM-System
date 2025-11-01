import { useState, useEffect, useCallback, useMemo } from "react";
import Papa from "papaparse";
import { DataTable } from "@/components/DataTable";
import { SchemeCounter } from "@/components/SchemeCounter";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, ClipboardList, MessageSquare, MessageCircle, Phone, Mail, Bell, GraduationCap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import SearchBar from "@/components/SearchBar";

// Google Sheets URL for Scholarships
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1mKHy1nYMGc_EGkA7X1T8609SPYBkhdBMwYlZSzfPfqk/edit?usp=sharing";
const SHEET_ID = "1mKHy1nYMGc_EGkA7X1T8609SPYBkhdBMwYlZSzfPfqk";
const SHEET_GID = "0"; // Default sheet GID

const Scholarships = () => {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshInterval] = useState(5000); // 5 seconds
  const [error, setError] = useState<string>("");
  const [isSending, setIsSending] = useState<{
    sms: boolean;
    whatsapp: boolean;
    call: boolean;
    email: boolean;
  }>({
    sms: false,
    whatsapp: false,
    call: false,
    email: false,
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const [customManagers, setCustomManagers] = useState<Array<{id: string; name: string; projects: any[]}>>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isManager, setIsManager] = useState(false);

  // Check authentication and role
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/me', {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.user);
        setIsManager(data.user.role === 'manager');
        
        // If manager, check if they have access to this page
        if (data.user.role === 'manager' && data.user.department !== 'egovernance') {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page",
            variant: "destructive",
          });
          navigate('/landing');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
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

  const fetchData = useCallback(async (url: string, showToast = true) => {
    if (!url) return;

    setIsLoading(true);
    setError("");

    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
      const response = await fetch(csvUrl);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setData(results.data as Record<string, any>[]);
            setIsConnected(true);
            if (showToast) {
              toast({
                title: "Data refreshed",
                description: `Successfully loaded ${results.data.length} scholarships`,
              });
            }
          }
        },
        error: (error: Error) => {
          setError(`Failed to parse data: ${error.message}`);
          setIsConnected(false);
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch data";
      setError(message);
      setIsConnected(false);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial connection on mount
  useEffect(() => {
    fetchData(SHEET_URL, false);
  }, [fetchData]);

  // Auto-refresh effect
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      fetchData(SHEET_URL, false);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isConnected, refreshInterval, fetchData]);

  // Calculate registration completed count
  const registrationCompletedCount = useMemo(() => {
    if (data.length === 0) return 0;
    
    // Find the column that contains "registration" (case-insensitive)
    const registrationColumn = Object.keys(data[0]).find(key => 
      key.toLowerCase().includes('registration')
    );
    
    if (!registrationColumn) return 0;
    
    // Count rows where registration is "completed"
    return data.filter(row => 
      String(row[registrationColumn]).toLowerCase().trim() === "completed"
    ).length;
  }, [data]);

  // Send SMS to all registered users
  const handleSendSMS = async () => {
    if (isSending.sms) return;
    
    setIsSending(prev => ({ ...prev, sms: true }));
    
    try {
      const smsWebhookUrl = 'https://aiagentgita.app.n8n.cloud/webhook/e0f19834-e3a1-4cc5-9a99-cf8a5a68800f';
      
      console.log('Triggering SMS workflow...', smsWebhookUrl);
      
      // Use Image object to bypass CORS - triggers webhook ONCE
      const img = new Image();
      img.src = smsWebhookUrl + '?t=' + Date.now();
      
      // Give it a moment to trigger
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "✅ SMS Campaign Started",
        description: `Workflow triggered successfully for ${data.length} registered users`,
      });
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: "Error",
        description: `Failed to send SMS notifications: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsSending(prev => ({ ...prev, sms: false }));
    }
  };

  // Send WhatsApp to all registered users
  const handleSendWhatsApp = async () => {
    if (isSending.whatsapp) return;
    
    setIsSending(prev => ({ ...prev, whatsapp: true }));
    
    try {
      const whatsappWebhookUrl = 'https://aiagentgita.app.n8n.cloud/webhook/effc3a08-0395-48b2-840f-b402b841a5e9';
      
      console.log('Triggering WhatsApp workflow...', whatsappWebhookUrl);
      
      // Use Image object to bypass CORS - triggers webhook ONCE
      const img = new Image();
      img.src = whatsappWebhookUrl + '?t=' + Date.now();
      
      // Give it a moment to trigger
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "✅ WhatsApp Campaign Started",
        description: `Workflow triggered successfully for ${data.length} registered users`,
      });
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      toast({
        title: "Error",
        description: `Failed to send WhatsApp notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsSending(prev => ({ ...prev, whatsapp: false }));
    }
  };

  // Make calls to all registered users
  const handleMakeCalls = async () => {
    if (isSending.call) return;
    
    setIsSending(prev => ({ ...prev, call: true }));
    
    try {
      const callWebhookUrl = 'https://aiagentgita.app.n8n.cloud/webhook/b0f98a53-8216-4355-80ca-e360e1c54432';
      
      console.log('Triggering Call workflow...', callWebhookUrl);
      
      // Use Image object to bypass CORS - triggers webhook ONCE
      const img = new Image();
      img.src = callWebhookUrl + '?t=' + Date.now();
      
      // Give it a moment to trigger
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "✅ Call Campaign Started",
        description: `Workflow triggered successfully for ${data.length} registered users`,
      });
    } catch (error) {
      console.error('Error making calls:', error);
      toast({
        title: "Error",
        description: `Failed to initiate calls: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsSending(prev => ({ ...prev, call: false }));
    }
  };

  // Send Email to all registered users
  const handleSendEmail = async () => {
    if (isSending.email) return;
    
    setIsSending(prev => ({ ...prev, email: true }));
    
    try {
      const emailWebhookUrl = 'https://aiagentgita.app.n8n.cloud/webhook/34f3d580-762c-4f37-b6a3-8819f512da67';
      
      console.log('Triggering Email workflow...', emailWebhookUrl);
      
      // Use Image object to bypass CORS - triggers webhook ONCE
      const img = new Image();
      img.src = emailWebhookUrl + '?t=' + Date.now();
      
      // Give it a moment to trigger
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "✅ Email Campaign Started",
        description: `Workflow triggered successfully for ${data.length} registered users`,
      });
    } catch (error) {
      console.error('Error sending emails:', error);
      toast({
        title: "Error",
        description: `Failed to send emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsSending(prev => ({ ...prev, email: false }));
    }
  };

  if (isLoading && !isConnected) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 mx-auto flex items-center justify-center animate-pulse shadow-2xl shadow-purple-500/40">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 animate-ping opacity-30"></div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 blur-2xl opacity-40"></div>
          </div>
          <div className="space-y-3">
            <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Loading Scholarship Data</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Syncing with government database...</p>
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !isConnected) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-red-200/60 dark:border-red-900/60 p-10 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center shadow-lg">
            <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Connection Error</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{error}</p>
          </div>
          <div className="pt-2">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex overflow-x-hidden">
      {!isManager && (
        <Sidebar 
          customManagers={customManagers} 
          onDeleteManager={handleDeleteManager}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}
      <main className={`flex-1 transition-all duration-300 overflow-x-hidden ${!isManager && (isSidebarCollapsed ? 'ml-16' : 'ml-64')}`}>
        {/* Top Bar */}
        <header className="h-16 border-b border-[#30363d] bg-[#010409] px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            {!isManager && <SearchBar customManagers={customManagers} />}
            {isManager && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#a371f7] to-[#8957e5] flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-semibold">Scholarship Manager</h1>
                  <p className="text-xs text-[#7d8590]">{currentUser?.fullName}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            <SchemeCounter count={registrationCompletedCount} />
            <button className="relative p-2 text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#1c2128] rounded-md transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#1f6feb] rounded-full"></span>
            </button>
            {isManager ? (
              <Button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#e6edf3] bg-[#0d1117] border border-[#30363d] rounded-md hover:border-[#58a6ff] hover:bg-[#1c2128] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a371f7] to-[#8957e5] flex items-center justify-center text-xs font-semibold">
                SH
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-[1800px] mx-auto p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#a371f7] to-[#8957e5] flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Scholarship Manager</h1>
                <p className="text-xs text-[#7d8590]">Government scholarship management and disbursement</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#7d8590]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a371f7] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a371f7]"></span>
              </span>
              Live Status
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#e6edf3]">Campaign Actions</h2>
                <p className="text-sm text-[#7d8590] mt-1">Send notifications to registered users</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Send Email Button */}
            <button
              onClick={handleSendEmail}
              disabled={isSending.email || data.length === 0}
              className="group relative bg-[#0d1117] border border-[#30363d] rounded-lg p-4 hover:border-[#ea4335] hover:bg-[#ea4335]/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#ea4335]/10 group-hover:bg-[#ea4335]/20 flex items-center justify-center transition-colors">
                  {isSending.email ? (
                    <svg className="animate-spin h-5 w-5 text-[#ea4335]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Mail className="h-5 w-5 text-[#ea4335]" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-[#e6edf3] group-hover:text-[#ea4335] transition-colors">
                    {isSending.email ? 'Sending...' : 'Send Email'}
                  </div>
                  <div className="text-xs text-[#7d8590]">Notify via email</div>
                </div>
              </div>
            </button>

            {/* Make Calls Button */}
            <button
              onClick={handleMakeCalls}
              disabled={isSending.call || data.length === 0}
              className="group relative bg-[#0d1117] border border-[#30363d] rounded-lg p-4 hover:border-[#1f6feb] hover:bg-[#1f6feb]/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#1f6feb]/10 group-hover:bg-[#1f6feb]/20 flex items-center justify-center transition-colors">
                  {isSending.call ? (
                    <svg className="animate-spin h-5 w-5 text-[#1f6feb]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Phone className="h-5 w-5 text-[#1f6feb]" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-[#e6edf3] group-hover:text-[#1f6feb] transition-colors">
                    {isSending.call ? 'Calling...' : 'Make Calls'}
                  </div>
                  <div className="text-xs text-[#7d8590]">Voice outreach</div>
                </div>
              </div>
            </button>

            {/* Send WhatsApp Button */}
            <button
              onClick={handleSendWhatsApp}
              disabled={isSending.whatsapp || data.length === 0}
              className="group relative bg-[#0d1117] border border-[#30363d] rounded-lg p-4 hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 group-hover:bg-[#25D366]/20 flex items-center justify-center transition-colors">
                  {isSending.whatsapp ? (
                    <svg className="animate-spin h-5 w-5 text-[#25D366]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <MessageCircle className="h-5 w-5 text-[#25D366]" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-[#e6edf3] group-hover:text-[#25D366] transition-colors">
                    {isSending.whatsapp ? 'Sending...' : 'WhatsApp'}
                  </div>
                  <div className="text-xs text-[#7d8590]">Instant messaging</div>
                </div>
              </div>
            </button>

            {/* Send SMS Button */}
            <button
              onClick={handleSendSMS}
              disabled={isSending.sms || data.length === 0}
              className="group relative bg-[#0d1117] border border-[#30363d] rounded-lg p-4 hover:border-[#a371f7] hover:bg-[#a371f7]/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#a371f7]/10 group-hover:bg-[#a371f7]/20 flex items-center justify-center transition-colors">
                  {isSending.sms ? (
                    <svg className="animate-spin h-5 w-5 text-[#a371f7]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <MessageSquare className="h-5 w-5 text-[#a371f7]" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-[#e6edf3] group-hover:text-[#a371f7] transition-colors">
                    {isSending.sms ? 'Sending...' : 'Send SMS'}
                  </div>
                  <div className="text-xs text-[#7d8590]">Text messages</div>
                </div>
              </div>
            </button>
            </div>
            
            {/* Registration Details Button */}
            <div className="mt-4">
              <Button 
                onClick={() => navigate("/scholarship-registration-details")}
                className="bg-[#0d1117] border border-[#30363d] hover:border-[#58a6ff] hover:bg-[#1c2128] text-[#e6edf3] transition-all duration-200"
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                View Registration Details
              </Button>
            </div>
          </div>

          {/* Data Table Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#e6edf3]">Government Scholarship Programs</h2>
                <p className="text-sm text-[#7d8590] mt-1">Real-time data from government databases</p>
              </div>
            </div>
            <div className="overflow-x-auto max-w-full">
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Scholarships;
