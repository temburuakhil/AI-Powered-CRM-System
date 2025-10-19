import { useState, useEffect, useCallback, useMemo } from "react";
import Papa from "papaparse";
import { DataTable } from "@/components/DataTable";
import { SchemeCounter } from "@/components/SchemeCounter";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, ClipboardList, MessageSquare, MessageCircle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Google Sheets URL for Scholarships
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1mKHy1nYMGc_EGkA7X1T8609SPYBkhdBMwYlZSzfPfqk/edit?usp=sharing";
const SHEET_ID = "1mKHy1nYMGc_EGkA7X1T8609SPYBkhdBMwYlZSzfPfqk";
const SHEET_GID = "0"; // Default sheet GID

const Scholarships = () => {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>();
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
            setData(results.data);
            setIsConnected(true);
            setLastUpdated(new Date());
            if (showToast) {
              toast({
                title: "Data refreshed",
                description: `Successfully loaded ${results.data.length} scholarships`,
              });
            }
          }
        },
        error: (error) => {
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
      const smsWebhookUrl = 'https://saumojitsantra.app.n8n.cloud/webhook/e0f19834-e3a1-4cc5-9a99-cf8a5a68800f';
      
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
      const whatsappWebhookUrl = 'https://saumojitsantra.app.n8n.cloud/webhook/effc3a08-0395-48b2-840f-b402b841a5e9';
      
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
      const callWebhookUrl = 'https://saumojitsantra.app.n8n.cloud/webhook/b0f98a53-8216-4355-80ca-e360e1c54432';
      
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
      const emailWebhookUrl = 'https://saumojitsantra.app.n8n.cloud/webhook/34f3d580-762c-4f37-b6a3-8819f512da67';
      
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Modern Header with Purple Theme */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-5">
          {/* Top Row - Logo, Title, and Status */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/e-governance")}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 blur-md opacity-40 -z-10"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                  Scholarship Manager Portal
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Government scholarship management and disbursement</p>
              </div>
            </div>

            {/* Right Side - Counter and Status */}
            <div className="flex items-center gap-4">
              {/* Animated Registration Counter */}
              <SchemeCounter count={registrationCompletedCount} />
              
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/60 dark:border-purple-800/60 shadow-sm">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping"></div>
                </div>
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">Live</span>
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

          {/* Bottom Row - Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Send Email Button */}
              <Button 
                onClick={handleSendEmail}
                disabled={isSending.email || data.length === 0}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {isSending.email ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Emails...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email to All
                  </>
                )}
              </Button>

              {/* Make Calls Button */}
              <Button 
                onClick={handleMakeCalls}
                disabled={isSending.call || data.length === 0}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {isSending.call ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Initiating Calls...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Call All
                  </>
                )}
              </Button>

              {/* Send WhatsApp Button */}
              <Button 
                onClick={handleSendWhatsApp}
                disabled={isSending.whatsapp || data.length === 0}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {isSending.whatsapp ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending WhatsApp...
                  </>
                ) : (
                  <>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Send WhatsApp to All
                  </>
                )}
              </Button>

              {/* Send SMS Button */}
              <Button 
                onClick={handleSendSMS}
                disabled={isSending.sms || data.length === 0}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {isSending.sms ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending SMS...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send SMS to All
                  </>
                )}
              </Button>

              {/* Registration Details Button */}
              <Button 
                onClick={() => navigate("/scholarship-registration-details")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                View Registration Details
              </Button>
            </div>
          </div>
        </div>

      {/* Main Content with Better Spacing */}
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-12">
        {/* Main Data Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-1.5 rounded-full bg-gradient-to-b from-purple-500 to-pink-600"></div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                  Government Scholarship Programs
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time data from government databases
                </p>
              </div>
            </div>
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
};

export default Scholarships;
