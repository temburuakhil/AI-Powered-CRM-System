import { useState, useEffect, useCallback, useMemo } from "react";
import Papa from "papaparse";
import { DataTable } from "@/components/DataTable";
import { LeadCounter } from "@/components/LeadCounter";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail, Phone, MessageCircle, MessageSquare, FileText, MessageSquareText, ArrowLeft, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1hyc1ZkQK9C6aVUvLe-jS-EiElQtIfKiUzDR0CNwv_oo/edit?usp=sharing";
const SHEET_ID = "1hyc1ZkQK9C6aVUvLe-jS-EiElQtIfKiUzDR0CNwv_oo";
const SHEET1_GID = "0"; // Before Course Enrollment (default sheet)
const SHEET2_GID = "394964549"; // Course Completion

const Training = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl sticky top-0 z-50 shadow-sm">
        {/* First Row - Logo, Title, and Stats */}
        <div className="max-w-[1800px] mx-auto px-8 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 blur-md opacity-40 -z-10"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                  OCAC Training CRM
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Odisha Computer Application Centre - Training Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <LeadCounter count={completedLeadsCount} />
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/60 dark:border-green-800/60 shadow-sm">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></div>
                </div>
                <span className="text-xs font-semibold text-green-700 dark:text-green-400">Live Status</span>
              </div>
            </div>
          </div>

          {/* Second Row - Navigation Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
            <Button
              onClick={() => navigate("/transcripts")}
              variant="outline"
              size="sm"
              className="gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <FileText className="w-4 h-4" />
              View Transcripts
            </Button>
            <Button
              onClick={() => navigate("/feedback")}
              variant="outline"
              size="sm"
              className="gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MessageSquareText className="w-4 h-4" />
              View Feedback
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-8 space-y-8">
        {/* Before Course Enrollment Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Before Course Enrollment</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Lead generation and enrollment tracking</p>
            </div>
            
            {/* Campaign Buttons */}
            <div className="flex items-center gap-3">
              <Button 
                onClick={sendEmailCampaign}
                disabled={emailLoading}
                className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30"
              >
                <Mail className="w-4 h-4" />
                {emailLoading ? "Sending..." : "Email Campaign"}
              </Button>
              
              <Button 
                onClick={sendCallCampaign}
                disabled={callLoading}
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30"
              >
                <Phone className="w-4 h-4" />
                {callLoading ? "Calling..." : "Call Campaign"}
              </Button>
              
              <Button 
                onClick={sendWhatsAppCampaign}
                disabled={whatsappLoading}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30"
              >
                <MessageCircle className="w-4 h-4" />
                {whatsappLoading ? "Sending..." : "WhatsApp Campaign"}
              </Button>
              
              <Button 
                onClick={sendSMSCampaign}
                disabled={smsLoading}
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30"
              >
                <MessageSquare className="w-4 h-4" />
                {smsLoading ? "Sending..." : "SMS Campaign"}
              </Button>
            </div>
          </div>

          <DataTable data={data} />
        </div>

        {/* After Course Completion Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">After Course Completion</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Post-completion feedback and engagement</p>
            </div>
            
            {/* Feedback Buttons */}
            <div className="flex items-center gap-3">
              <Button 
                onClick={sendEmailFeedback}
                disabled={emailFeedbackLoading}
                className="gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg shadow-orange-500/30"
              >
                <Mail className="w-4 h-4" />
                {emailFeedbackLoading ? "Sending..." : "Email Feedback"}
              </Button>
              
              <Button 
                onClick={sendWhatsAppFeedback}
                disabled={whatsappFeedbackLoading}
                className="gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg shadow-teal-500/30"
              >
                <MessageCircle className="w-4 h-4" />
                {whatsappFeedbackLoading ? "Sending..." : "WhatsApp Feedback"}
              </Button>
            </div>
          </div>

          <DataTable data={courseCompletionData} />
        </div>
      </div>
    </div>
  );
};

export default Training;
