import { useState, useEffect, useCallback, useMemo } from "react";
import Papa from "papaparse";
import { DataTable } from "@/components/DataTable";
import { LeadCounter } from "@/components/LeadCounter";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail, Phone, MessageCircle, MessageSquare } from "lucide-react";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1hyc1ZkQK9C6aVUvLe-jS-EiElQtIfKiUzDR0CNwv_oo/edit?usp=sharing";

const Index = () => {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>();
  const [refreshInterval] = useState(5000); // 5 seconds
  const [error, setError] = useState<string>("");
  const [isStartingCampaign, setIsStartingCampaign] = useState(false);
  const [isStartingCallCampaign, setIsStartingCallCampaign] = useState(false);
  const [isStartingWhatsAppCampaign, setIsStartingWhatsAppCampaign] = useState(false);
  const [isStartingSMSCampaign, setIsStartingSMSCampaign] = useState(false);
  const { toast } = useToast();

  const startEmailCampaign = async () => {
    setIsStartingCampaign(true);
    try {
      // Production webhook URL - GET method
      const webhookUrl = "https://saumojitsantra.app.n8n.cloud/webhook/64d94d32-3580-4730-90f9-1e64895c90fe";
      
      console.log('Triggering Email Campaign workflow...', webhookUrl);
      
      // Use Image object to bypass CORS for GET requests
      const img = new Image();
      img.src = webhookUrl + '?t=' + Date.now();
      
      // Give it a moment to trigger
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "✅ Email Campaign Started",
        description: `Workflow triggered successfully for ${completedLeadsCount} completed leads.`,
      });
      
    } catch (error) {
      console.error('Error triggering email workflow:', error);
      toast({
        title: "Error",
        description: `Failed to start email campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsStartingCampaign(false);
    }
  };

  const startCallCampaign = async () => {
    setIsStartingCallCampaign(true);
    try {
      // Production webhook URL - GET method
      const webhookUrl = "https://saumojitsantra.app.n8n.cloud/webhook/9ffc0f31-1f1b-4556-92a5-f4762baed323";
      
      console.log('Triggering Call Campaign workflow...', webhookUrl);
      
      // Use Image object to bypass CORS for GET requests
      const img = new Image();
      img.src = webhookUrl + '?t=' + Date.now();
      
      // Give it a moment to trigger
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "📞 Call Campaign Started",
        description: `Workflow triggered successfully for ${completedLeadsCount} completed leads.`,
      });
      
    } catch (error) {
      console.error('Error triggering call workflow:', error);
      toast({
        title: "Error",
        description: `Failed to start call campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsStartingCallCampaign(false);
    }
  };

  const startWhatsAppCampaign = async () => {
    setIsStartingWhatsAppCampaign(true);
    try {
      // Production webhook URL - GET method
      const webhookUrl = "https://saumojitsantra.app.n8n.cloud/webhook/78ebcdc8-7562-42c0-bc92-6ac723e2ac4a";
      
      console.log('Triggering WhatsApp Campaign workflow...', webhookUrl);
      
      // Use Image object to bypass CORS for GET requests
      const img = new Image();
      img.src = webhookUrl + '?t=' + Date.now();
      
      // Give it a moment to trigger
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "💬 WhatsApp Campaign Started",
        description: `Workflow triggered successfully for ${completedLeadsCount} completed leads.`,
      });
      
    } catch (error) {
      console.error('Error triggering WhatsApp workflow:', error);
      toast({
        title: "Error",
        description: `Failed to start WhatsApp campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsStartingWhatsAppCampaign(false);
    }
  };

  const startSMSCampaign = async () => {
    setIsStartingSMSCampaign(true);
    try {
      // Production webhook URL - GET method
      const webhookUrl = "https://saumojitsantra.app.n8n.cloud/webhook/950d3eeb-b0f1-4b1f-a2bc-572856f2e098";
      
      console.log('Triggering SMS Campaign workflow...', webhookUrl);
      
      // Use Image object to bypass CORS for GET requests
      const img = new Image();
      img.src = webhookUrl + '?t=' + Date.now();
      
      // Give it a moment to trigger
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "📱 SMS Campaign Started",
        description: `Workflow triggered successfully for ${completedLeadsCount} completed leads.`,
      });
      
    } catch (error) {
      console.error('Error triggering SMS workflow:', error);
      toast({
        title: "Error",
        description: `Failed to start SMS campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsStartingSMSCampaign(false);
    }
  };

  const fetchData = useCallback(async (url: string, showToast = true) => {
    if (!url) return;

    setIsLoading(true);
    setError("");

    try {
      // Convert Google Sheets URL to CSV export URL if needed
      let csvUrl = url;
      if (url.includes("docs.google.com/spreadsheets")) {
        const sheetId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
        if (sheetId) {
          csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        }
      }

      const response = await fetch(csvUrl);
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setData(results.data);
            setIsConnected(true);
            setLastUpdated(new Date());
            if (showToast) {
              toast({
                title: "Data refreshed",
                description: `Successfully loaded ${results.data.length} records`,
              });
            }
          } else {
            setError("No data found in the sheet");
          }
        },
        error: (error) => {
          setError(`Failed to parse CSV: ${error.message}`);
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

  // Calculate completed leads count from "INTEREST FORM" column
  const completedLeadsCount = useMemo(() => {
    if (data.length === 0) return 0;
    
    // Find the column name that contains "interest" and "form" (case-insensitive)
    const interestFormColumn = Object.keys(data[0]).find(key => 
      key.toLowerCase().includes('interest') && key.toLowerCase().includes('form')
    );
    
    if (!interestFormColumn) return 0;
    
    // Count rows where the interest form column value is "Completed"
    return data.filter(row => 
      String(row[interestFormColumn]).toLowerCase().trim() === "completed"
    ).length;
  }, [data]);

  if (isLoading && !isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 mx-auto flex items-center justify-center animate-pulse shadow-2xl shadow-blue-500/40">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 animate-ping opacity-30"></div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 blur-2xl opacity-40"></div>
          </div>
          <div className="space-y-3">
            <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Loading training data</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Syncing with OCAC database...</p>
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
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
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Modern Header with Enhanced Design */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 blur-md opacity-40 -z-10"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                  OCAC Training Manager
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time training synchronization</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Email Campaign Button */}
              <Button 
                onClick={startEmailCampaign}
                disabled={isStartingCampaign || data.length === 0}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStartingCampaign ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Start Email Campaign
                  </>
                )}
              </Button>

              {/* Call Campaign Button */}
              <Button 
                onClick={startCallCampaign}
                disabled={isStartingCallCampaign || data.length === 0}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStartingCallCampaign ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Start Call Campaign
                  </>
                )}
              </Button>

              {/* WhatsApp Campaign Button */}
              <Button 
                onClick={startWhatsAppCampaign}
                disabled={isStartingWhatsAppCampaign || data.length === 0}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStartingWhatsAppCampaign ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting...
                  </>
                ) : (
                  <>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Start WhatsApp Campaign
                  </>
                )}
              </Button>

              {/* SMS Campaign Button */}
              <Button 
                onClick={startSMSCampaign}
                disabled={isStartingSMSCampaign || data.length === 0}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStartingSMSCampaign ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Start SMS Campaign
                  </>
                )}
              </Button>

              {/* Animated Lead Counter */}
              <LeadCounter count={completedLeadsCount} />
              
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/60 dark:border-green-800/60 shadow-sm">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></div>
                </div>
                <span className="text-xs font-semibold text-green-700 dark:text-green-400">Live</span>
              </div>
              {lastUpdated && (
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 px-3 py-2 rounded-lg">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{lastUpdated.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Better Spacing */}
      <div className="max-w-7xl mx-auto px-8 py-10">
        <DataTable data={data} />
      </div>
    </div>
  );
};

export default Index;
