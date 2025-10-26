import { useState, useEffect, useCallback, useMemo } from "react";
import Papa from "papaparse";
import { DataTable } from "@/components/DataTable";
import { LeadCounter } from "@/components/LeadCounter";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail, Phone, MessageCircle, MessageSquare, Bell, BookOpen } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import SearchBar from "@/components/SearchBar";

const SHEET_ID = "1hyc1ZkQK9C6aVUvLe-jS-EiElQtIfKiUzDR0CNwv_oo";
const SHEET1_GID = "0"; // Before Course Enrollment (default sheet)
const SHEET2_GID = "394964549"; // Course Completion

const Training = () => {
  const { toast } = useToast();

  const [customManagers, setCustomManagers] = useState<Array<{id: string; name: string; projects: any[]}>>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [data, setData] = useState<string[][]>([]);
  const [courseCompletionData, setCourseCompletionData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [callLoading, setCallLoading] = useState(false);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [whatsappFeedbackLoading, setWhatsappFeedbackLoading] = useState(false);
  const [emailFeedbackLoading, setEmailFeedbackLoading] = useState(false);

  const sendEmailCampaign = async () => {
    setEmailLoading(true);
    try {
      const webhookUrl = "https://saumojitsantra.app.n8n.cloud/webhook/64d94d32-3580-4730-90f9-1e64895c90fe";
      const img = new Image();
      img.src = webhookUrl;
      
      toast({
        title: "Email Campaign Started",
        description: "Processing email campaigns in the background...",
      });
      
      setTimeout(() => setEmailLoading(false), 2000);
    } catch (error) {
      console.error("Email campaign error:", error);
      setEmailLoading(false);
      toast({
        title: "Error",
        description: "Failed to start email campaign",
        variant: "destructive",
      });
    }
  };

  const sendCallCampaign = async () => {
    setCallLoading(true);
    try {
      const webhookUrl = "https://saumojitsantra.app.n8n.cloud/webhook/9ffc0f31-1f1b-4556-92a5-f4762baed323";
      const img = new Image();
      img.src = webhookUrl;
      
      toast({
        title: "Call Campaign Started",
        description: "Processing call campaigns in the background...",
      });
      
      setTimeout(() => setCallLoading(false), 2000);
    } catch (error) {
      console.error("Call campaign error:", error);
      setCallLoading(false);
      toast({
        title: "Error",
        description: "Failed to start call campaign",
        variant: "destructive",
      });
    }
  };

  const sendWhatsAppCampaign = async () => {
    setWhatsappLoading(true);
    try {
      const webhookUrl = "https://saumojitsantra.app.n8n.cloud/webhook/78ebcdc8-7562-42c0-bc92-6ac723e2ac4a";
      const img = new Image();
      img.src = webhookUrl;
      
      toast({
        title: "WhatsApp Campaign Started",
        description: "Processing WhatsApp campaigns in the background...",
      });
      
      setTimeout(() => setWhatsappLoading(false), 2000);
    } catch (error) {
      console.error("WhatsApp campaign error:", error);
      setWhatsappLoading(false);
      toast({
        title: "Error",
        description: "Failed to start WhatsApp campaign",
        variant: "destructive",
      });
    }
  };

  const sendSMSCampaign = async () => {
    setSmsLoading(true);
    try {
      const webhookUrl = "https://saumojitsantra.app.n8n.cloud/webhook/950d3eeb-b0f1-4b1f-a2bc-572856f2e098";
      const img = new Image();
      img.src = webhookUrl;
      
      toast({
        title: "SMS Campaign Started",
        description: "Processing SMS campaigns in the background...",
      });
      
      setTimeout(() => setSmsLoading(false), 2000);
    } catch (error) {
      console.error("SMS campaign error:", error);
      setSmsLoading(false);
      toast({
        title: "Error",
        description: "Failed to start SMS campaign",
        variant: "destructive",
      });
    }
  };

  const sendWhatsAppFeedback = async () => {
    setWhatsappFeedbackLoading(true);
    try {
      const webhookUrl = "https://saumojitsantra.app.n8n.cloud/webhook/03bdef8b-fd15-4cc1-9653-42d99b3dfdd7";
      const img = new Image();
      img.src = webhookUrl;
      
      toast({
        title: "WhatsApp Feedback Started",
        description: "Sending WhatsApp feedback requests...",
      });
      
      setTimeout(() => setWhatsappFeedbackLoading(false), 2000);
    } catch (error) {
      console.error("WhatsApp feedback error:", error);
      setWhatsappFeedbackLoading(false);
      toast({
        title: "Error",
        description: "Failed to send WhatsApp feedback",
        variant: "destructive",
      });
    }
  };

  const sendEmailFeedback = async () => {
    setEmailFeedbackLoading(true);
    try {
      const webhookUrl = "https://saumojitsantra.app.n8n.cloud/webhook/3d51c0ec-8f8c-466a-89b0-0982646ebbb3";
      const img = new Image();
      img.src = webhookUrl;
      
      toast({
        title: "Email Feedback Started",
        description: "Sending email feedback requests...",
      });
      
      setTimeout(() => setEmailFeedbackLoading(false), 2000);
    } catch (error) {
      console.error("Email feedback error:", error);
      setEmailFeedbackLoading(false);
      toast({
        title: "Error",
        description: "Failed to send email feedback",
        variant: "destructive",
      });
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Before Course Enrollment sheet
      const csvUrl1 = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET1_GID}`;
      const response1 = await fetch(csvUrl1);
      if (!response1.ok) throw new Error("Failed to fetch data from Before Course Enrollment sheet");
      
      const csvText1 = await response1.text();
      
      Papa.parse(csvText1, {
        complete: (results) => {
          const parsedData = results.data as string[][];
          console.log("Before Course Enrollment data loaded:", parsedData.length, "rows");
          if (parsedData.length > 0) {
            console.log("Headers:", parsedData[0]);
          }
          setData(parsedData);
        },
        error: (error: Error) => {
          console.error("Parse error:", error);
          setError("Failed to parse Before Course Enrollment data");
        },
      });

      // Fetch Course Completion sheet
      const csvUrl2 = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET2_GID}`;
      const response2 = await fetch(csvUrl2);
      if (!response2.ok) throw new Error("Failed to fetch data from Course Completion sheet");
      
      const csvText2 = await response2.text();
      
      Papa.parse(csvText2, {
        complete: (results) => {
          setCourseCompletionData(results.data as string[][]);
        },
        error: (error: Error) => {
          console.error("Parse error:", error);
          setError("Failed to parse Course Completion data");
        },
      });

      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const completedLeadsCount = useMemo(() => {
    if (data.length <= 1) return 0;
    
    const headers = data[0];
    
    // Try to find the "INTEREST FORM" column - check various possible column names
    const interestFormIndex = headers.findIndex(
      (header) => {
        const normalizedHeader = header?.toString().toLowerCase().trim();
        return normalizedHeader.includes("interest") || 
               normalizedHeader.includes("form") ||
               normalizedHeader === "interest form" ||
               normalizedHeader === "interestform";
      }
    );
    
    if (interestFormIndex === -1) {
      console.log("Interest Form column not found. Available columns:", headers);
      return 0;
    }
    
    const count = data.slice(1).filter((row) => {
      const value = row[interestFormIndex];
      const normalizedValue = value?.toString().toLowerCase().trim();
      // Count both "yes" and "completed" as completed leads
      return normalizedValue === "yes" || normalizedValue === "completed";
    }).length;
    
    console.log(`Found ${count} completed leads from column: ${headers[interestFormIndex]}`);
    return count;
  }, [data]);

  if (loading && data.length === 0 && courseCompletionData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading training data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <div className="space-y-2">
              <p className="font-semibold">Error loading training data</p>
              <p className="text-sm">{error}</p>
              <Button onClick={fetchData} variant="outline" size="sm" className="mt-2">
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex">
      <Sidebar 
        customManagers={customManagers} 
        onDeleteManager={() => {}}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Top Bar */}
        <header className="h-16 border-b border-[#30363d] bg-[#010409] px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <SearchBar customManagers={JSON.parse(localStorage.getItem("customManagers") || "[]")} />
          </div>
          <div className="flex items-center gap-6">
            <LeadCounter count={completedLeadsCount} />
            <button className="relative p-2 text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#1c2128] rounded-md transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#1f6feb] rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#58a6ff] to-[#1f6feb] flex items-center justify-center text-xs font-semibold">
              TR
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-[1800px] mx-auto p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#58a6ff] to-[#1f6feb] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">OCAC Training CRM</h1>
                <p className="text-xs text-[#7d8590]">Odisha Computer Application Centre - Training Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#7d8590]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3fb950] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3fb950]"></span>
              </span>
              Live Status
            </div>
          </div>

          {/* Before Course Enrollment Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#e6edf3]">Before Course Enrollment</h2>
              <p className="text-sm text-[#7d8590] mt-1">Lead generation and enrollment tracking</p>
            </div>
            
            {/* Campaign Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={sendEmailCampaign}
                disabled={emailLoading}
                className="group relative bg-[#0d1117] border border-[#30363d] rounded-lg p-4 hover:border-[#ea4335] hover:bg-[#ea4335]/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#ea4335]/10 group-hover:bg-[#ea4335]/20 flex items-center justify-center transition-colors">
                    {emailLoading ? (
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
                      {emailLoading ? 'Sending...' : 'Email Campaign'}
                    </div>
                    <div className="text-xs text-[#7d8590]">Notify via email</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={sendCallCampaign}
                disabled={callLoading}
                className="group relative bg-[#0d1117] border border-[#30363d] rounded-lg p-4 hover:border-[#1f6feb] hover:bg-[#1f6feb]/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1f6feb]/10 group-hover:bg-[#1f6feb]/20 flex items-center justify-center transition-colors">
                    {callLoading ? (
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
                      {callLoading ? 'Calling...' : 'Call Campaign'}
                    </div>
                    <div className="text-xs text-[#7d8590]">Voice outreach</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={sendWhatsAppCampaign}
                disabled={whatsappLoading}
                className="group relative bg-[#0d1117] border border-[#30363d] rounded-lg p-4 hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 group-hover:bg-[#25D366]/20 flex items-center justify-center transition-colors">
                    {whatsappLoading ? (
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
                      {whatsappLoading ? 'Sending...' : 'WhatsApp'}
                    </div>
                    <div className="text-xs text-[#7d8590]">Instant messaging</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={sendSMSCampaign}
                disabled={smsLoading}
                className="group relative bg-[#0d1117] border border-[#30363d] rounded-lg p-4 hover:border-[#a371f7] hover:bg-[#a371f7]/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#a371f7]/10 group-hover:bg-[#a371f7]/20 flex items-center justify-center transition-colors">
                    {smsLoading ? (
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
                      {smsLoading ? 'Sending...' : 'SMS Campaign'}
                    </div>
                    <div className="text-xs text-[#7d8590]">Text messages</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <DataTable data={data} />
          
          {/* After Course Completion Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#e6edf3]">After Course Completion</h2>
              <p className="text-sm text-[#7d8590] mt-1">Post-completion feedback and engagement</p>
            </div>
            
            {/* Feedback Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={sendEmailFeedback}
                disabled={emailFeedbackLoading}
                className="group relative bg-[#0d1117] border border-[#30363d] rounded-lg p-4 hover:border-[#ea4335] hover:bg-[#ea4335]/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#ea4335]/10 group-hover:bg-[#ea4335]/20 flex items-center justify-center transition-colors">
                    {emailFeedbackLoading ? (
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
                      {emailFeedbackLoading ? 'Sending...' : 'Email Feedback'}
                    </div>
                    <div className="text-xs text-[#7d8590]">Collect feedback</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={sendWhatsAppFeedback}
                disabled={whatsappFeedbackLoading}
                className="group relative bg-[#0d1117] border border-[#30363d] rounded-lg p-4 hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 group-hover:bg-[#25D366]/20 flex items-center justify-center transition-colors">
                    {whatsappFeedbackLoading ? (
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
                      {whatsappFeedbackLoading ? 'Sending...' : 'WhatsApp Feedback'}
                    </div>
                    <div className="text-xs text-[#7d8590]">Quick responses</div>
                  </div>
                </div>
              </button>
            </div>

            <DataTable data={courseCompletionData} />
          </div>
        </div>
    </main>
  </div>
  );
};

export default Training;
