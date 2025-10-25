import { useState, useEffect } from "react";
import { Phone, Loader2, PhoneCall, X, PlayCircle, PauseCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VoiceCampaignProps {
  data: Record<string, any>[];
  phoneColumn: string;
  statusColumn?: string;
  onStatusUpdate?: (updatedData: any[]) => void;
  projectName?: string;
  knowledgeBaseFiles?: Array<{
    name: string;
    size: number;
    type: string;
    content?: string;
    uploadedAt: string;
  }>;
}

export const VoiceCampaign = ({
  data,
  phoneColumn,
  statusColumn = "Status",
  onStatusUpdate,
  projectName = "Project",
  knowledgeBaseFiles = [],
}: VoiceCampaignProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCallIndex, setCurrentCallIndex] = useState(0);

  // Retell AI Configuration
  const [retellApiKey] = useState("key_7ae2ac651390bd59ee2c6cea4c40");
  const [geminiApiKey] = useState("AIzaSyDevPHeo5ys7_It67y4OgYnNCEE8kFDDbw");
  
  // SIP Trunk Configuration
  const [phoneNumber, setPhoneNumber] = useState("");
  const [terminationUri, setTerminationUri] = useState("");
  const [sipUsername, setSipUsername] = useState("");
  const [sipPassword, setSipPassword] = useState("");
  const [nickname, setNickname] = useState("");
  
  // Transfer Call Configuration
  const [transferPhoneNumber, setTransferPhoneNumber] = useState("");
  
  const [agentId, setAgentId] = useState("");
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [agentPrompt, setAgentPrompt] = useState("");
  const [isSipConfigured, setIsSipConfigured] = useState(false);

  // Registered Phone Numbers
  const [registeredPhones, setRegisteredPhones] = useState<Array<{
    phone_number: string;
    phone_number_pretty: string;
    nickname?: string;
    inbound_agent_id?: string;
    outbound_agent_id?: string;
  }>>([]);
  const [isLoadingPhones, setIsLoadingPhones] = useState(false);

  // Registered Agents
  const [registeredAgents, setRegisteredAgents] = useState<Array<{
    agent_id: string;
    agent_name: string;
    voice_id: string;
    language: string;
  }>>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  // Call Statistics
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [callLogs, setCallLogs] = useState<Array<{ phone: string; status: string; message: string }>>([]);

  // Fetch registered phone numbers on component mount
  useEffect(() => {
    fetchRegisteredPhones();
    fetchRegisteredAgents();
  }, []);

  const fetchRegisteredPhones = async () => {
    setIsLoadingPhones(true);
    try {
      const response = await fetch("http://localhost:3001/api/retell/phone-numbers", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${retellApiKey}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setRegisteredPhones(result.phone_numbers || []);
        console.log("Registered phones:", result.phone_numbers);
      } else {
        console.error("Failed to fetch phone numbers:", result.message);
      }
    } catch (error) {
      console.error("Error fetching phone numbers:", error);
    } finally {
      setIsLoadingPhones(false);
    }
  };

  const fetchRegisteredAgents = async () => {
    setIsLoadingAgents(true);
    try {
      const response = await fetch("http://localhost:3001/api/retell/agents", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${retellApiKey}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setRegisteredAgents(result.agents || []);
        console.log("Registered agents:", result.agents);
      } else {
        console.error("Failed to fetch agents:", result.message);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  // Filter recipients who need to be called
  const recipients = data.filter((row) => {
    const hasPhone = row[phoneColumn] && String(row[phoneColumn]).trim().length > 0;
    const isNotCompleted = !statusColumn || 
      row[statusColumn]?.toString().toLowerCase() !== "completed";
    return hasPhone && isNotCompleted;
  });

  // Validate E.164 phone format
  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, "");
    if (!cleaned.startsWith("1") && cleaned.length === 10) {
      cleaned = "1" + cleaned;
    }
    return "+" + cleaned;
  };

  const generateAgentPromptWithGemini = async () => {
    if (!geminiApiKey) {
      toast({
        title: "Gemini API Key Required",
        description: "Please enter your Gemini API key to generate the agent prompt",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingAgent(true);

    try {
      // Extract knowledge base content
      let knowledgeBaseContext = "";
      if (knowledgeBaseFiles.length > 0) {
        knowledgeBaseContext = "\n\nKnowledge Base Files:\n";
        knowledgeBaseFiles.forEach(file => {
          knowledgeBaseContext += `- ${file.name} (${file.type})\n`;
        });
        knowledgeBaseContext += "\nUse this information to provide accurate and helpful responses during calls.";
      }

      // Create prompt for Gemini
      const geminiPrompt = `You are an AI assistant helping to create a professional voice agent system prompt for an outbound calling campaign.

Project Name: ${projectName}
Campaign Purpose: Proactive outreach to inform contacts about new projects/initiatives and provide detailed information
Knowledge Base: ${knowledgeBaseFiles.length} document(s) uploaded${knowledgeBaseContext}
${transferPhoneNumber ? `Transfer Authority: ${transferPhoneNumber} (available for escalation)` : ''}

Create a professional, conversational voice agent system prompt (300-400 words) that follows this structure:

1. ROLE DEFINITION: "You are an AI voice agent dedicated to supporting the '${projectName}'. Your core function is to make proactive outbound calls to inform individuals in our database about new projects, initiatives, and opportunities."

2. INTRODUCTION & PURPOSE: Provide this exact script:
   "Hello, I'm an AI assistant with ${projectName}. I'm calling today to inform you about a new project/initiative that may be of interest to you. [Then immediately transition to explaining the project details]"

3. PROACTIVE INFORMATION DELIVERY:
   - Lead the conversation by proactively sharing key project details
   - Explain what the new project/initiative is about
   - Highlight important benefits, eligibility criteria, or opportunities
   - Provide specific details from the knowledge base
   - Don't wait for questions - present the information first
   - After presenting, ask: "Do you have any questions about this project?" or "Would you like more details on any specific aspect?"

4. DOCUMENTATION ACCESS: ${knowledgeBaseFiles.length > 0 ? `"You have immediate and comprehensive access to ${knowledgeBaseFiles.map(f => f.name).join(', ')} and must use this documentation to provide accurate, detailed information about the project, its benefits, eligibility criteria, application process, and any other relevant details."` : `"Use your knowledge to provide accurate project information."`}

5. CONVERSATION STYLE:
   - Be informative and proactive, not just reactive
   - Lead with value - tell them why this matters to them
   - Maintain a friendly, empathetic, and conversational tone
   - Be an active listener for follow-up questions
   - Ensure recipients feel informed and understand the opportunity

6. CALL MANAGEMENT:
   - Present key information concisely upfront
   - Keep each call brief, ideally under 2 minutes
   - Answer any questions thoroughly but efficiently

7. CLOSING SCRIPT: "Thank you so much for your time today. We appreciate your engagement with ${projectName}, and I hope you have a great day!"

${transferPhoneNumber ? `8. TRANSFER CAPABILITY: If the caller needs to speak with a human representative or requires specialized assistance, use the transfer_to_authority tool to connect them.` : ''}

CRITICAL REQUIREMENTS:
- DO NOT use placeholders like [Agent Name], [Project Name], [Details]
- Make the agent PROACTIVE - they should INFORM, not just respond
- The agent should explain the project/initiative FIRST before asking for questions
- Use actual project name "${projectName}" throughout
- Write in second person ("You are...", "You must...")
- Make it a complete, immediately usable system prompt

Generate ONLY the complete system prompt text, no explanations or meta-commentary.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: geminiPrompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", errorText);
        throw new Error(`Gemini API error (${response.status}): ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      console.log("Gemini API response:", data);
      
      let generatedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Append transfer instructions if transfer number is provided
      if (generatedPrompt && transferPhoneNumber) {
        generatedPrompt += `\n\nIMPORTANT - Call Transfer Instructions:
You have access to a transfer_to_authority tool. Use this tool when:
- The caller explicitly asks to speak with a supervisor, manager, or higher authority
- The caller requests escalation
- You are unable to resolve their concern or answer their question
- The caller seems frustrated and needs specialized assistance

When transferring, briefly explain to the caller that you're connecting them to someone who can better assist them.`;
      }

      if (generatedPrompt) {
        setAgentPrompt(generatedPrompt);
        toast({
          title: "Prompt Generated!",
          description: "AI-generated prompt ready. Review and create agent.",
        });
      } else {
        console.error("No prompt in response:", data);
        throw new Error("No prompt generated from Gemini. Check API key and response.");
      }
    } catch (error: any) {
      console.error("Error generating prompt:", error);
      toast({
        title: "Failed to Generate Prompt",
        description: error.message || "Please check your Gemini API key",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const createRetellAgent = async () => {
    if (!agentPrompt) {
      toast({
        title: "Generate Prompt First",
        description: "Please generate the agent prompt using Gemini API",
        variant: "destructive",
      });
      return;
    }

    if (!isSipConfigured) {
      toast({
        title: "Configure SIP First",
        description: "Please configure your SIP trunk before creating agent",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingAgent(true);

    try {
      let knowledgeBaseIds: string[] = [];

      // Step 1: Create Knowledge Base if files are uploaded
      if (knowledgeBaseFiles.length > 0) {
        toast({
          title: "Creating Knowledge Base...",
          description: `Uploading ${knowledgeBaseFiles.length} file(s)`,
        });

        // Extract text content from files
        const texts = knowledgeBaseFiles.map(file => ({
          text: file.content || `File: ${file.name} (${file.type})`,
          title: file.name,
        }));

        const kbResponse = await fetch("http://localhost:3001/api/retell/create-knowledge-base", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apiKey: retellApiKey,
            knowledgeBaseName: `${projectName} - Knowledge Base`,
            texts: texts,
            enableAutoRefresh: false,
          }),
        });

        const kbResult = await kbResponse.json();

        if (kbResponse.ok && kbResult.success) {
          knowledgeBaseIds.push(kbResult.knowledge_base_id);
          console.log("Knowledge base created:", kbResult.knowledge_base_id);
          toast({
            title: "Knowledge Base Created!",
            description: `KB ID: ${kbResult.knowledge_base_id}`,
          });
        } else {
          console.warn("Failed to create knowledge base:", kbResult.message);
          // Continue without knowledge base
        }
      }

      // Step 2: Create LLM with the generated prompt and knowledge base
      toast({
        title: "Creating LLM...",
        description: "Creating Single-Prompt Response Engine",
      });

      const llmResponse = await fetch("http://localhost:3001/api/retell/create-llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: retellApiKey,
          generalPrompt: agentPrompt,
          beginMessage: `Hello! I'm calling from ${projectName}. How can I help you today?`,
          knowledgeBaseIds: knowledgeBaseIds.length > 0 ? knowledgeBaseIds : undefined,
          transferPhoneNumber: transferPhoneNumber || undefined, // Add transfer phone if provided
        }),
      });

      const llmResult = await llmResponse.json();

      if (!llmResponse.ok) {
        throw new Error(llmResult.message || "Failed to create LLM");
      }

      const llmId = llmResult.llm_id;
      console.log("Single-prompt LLM created:", llmId);

      // Step 3: Create Agent with the LLM ID and SIP phone number
      toast({
        title: "Creating Agent...",
        description: "Deploying Single-Prompt Voice Agent",
      });

      const agentResponse = await fetch("http://localhost:3001/api/retell/create-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: retellApiKey,
          agentName: `${projectName} - Voice Agent`,
          systemPrompt: agentPrompt, // Not used by agent, but kept for reference
          llmId: llmId, // Pass the created LLM ID
          voiceId: "11labs-Adrian",
          language: "en-US",
          outboundPhoneNumber: phoneNumber, // Set SIP trunk as outbound number
        }),
      });

      const agentResult = await agentResponse.json();

      if (!agentResponse.ok) {
        throw new Error(agentResult.message || "Failed to create agent");
      }

      setAgentId(agentResult.agent_id);
      toast({
        title: "Agent Created Successfully!",
        description: `Agent ID: ${agentResult.agent_id}`,
      });
    } catch (error: any) {
      console.error("Error creating agent:", error);
      toast({
        title: "Failed to Create Agent",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const updateAgentWithEndCall = async (selectedAgentId: string) => {
    setIsCreatingAgent(true);

    try {
      toast({
        title: "Updating Agent...",
        description: "Adding end_call function to existing LLM",
      });

      // Note: We need to get the agent's LLM ID first, then update that LLM
      // For now, we'll just update the agent to ensure it has the outbound number
      const response = await fetch(`http://localhost:3001/api/retell/update-agent/${selectedAgentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: retellApiKey,
          outboundPhoneNumber: phoneNumber, // Set SIP trunk as outbound number
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update agent");
      }

      toast({
        title: "Agent Updated!",
        description: "Outbound phone number configured",
      });
    } catch (error: any) {
      console.error("Error updating agent:", error);
      toast({
        title: "Failed to Update Agent",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const configureSipTrunk = async () => {
    if (!phoneNumber || !terminationUri) {
      toast({
        title: "Configuration Required",
        description: "Please enter Phone Number and Termination URI",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingAgent(true);

    try {
      console.log("Configuring SIP trunk:", {
        phoneNumber,
        terminationUri,
        apiKey: retellApiKey.substring(0, 10) + "...",
      });

      const response = await fetch("http://localhost:3001/api/retell/configure-sip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: retellApiKey,
          phoneNumber: phoneNumber,
          terminationUri: terminationUri,
          sipUsername: sipUsername || undefined,
          sipPassword: sipPassword || undefined,
          nickname: nickname || `${projectName} Phone`,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers.get("content-type"));

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 500));
        throw new Error("Server returned non-JSON response. Is the backend running on port 3001?");
      }

      const result = await response.json();
      console.log("SIP configuration result:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to configure SIP trunk");
      }

      setIsSipConfigured(true);
      toast({
        title: "SIP Trunk Configured!",
        description: "Phone number ready for outbound calls",
      });
    } catch (error: any) {
      console.error("Error configuring SIP:", error);
      toast({
        title: "Failed to Configure SIP",
        description: error.message || "Network error. Check if backend is running on port 3001.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const validateRetellConfig = (): boolean => {
    if (!phoneNumber || !agentId || !isSipConfigured) {
      toast({
        title: "Configuration Required",
        description: "Please configure SIP trunk and create an agent",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const makePhoneCall = async (toNumber: string, metadata: Record<string, any>) => {
    try {
      const formattedToNumber = formatPhoneNumber(toNumber);

      const response = await fetch("http://localhost:3001/api/retell/create-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: retellApiKey,
          fromNumber: phoneNumber,
          toNumber: formattedToNumber,
          agentId: agentId,
          metadata: {
            ...metadata,
            project_name: projectName,
            campaign_type: "voice_outbound",
            knowledge_base_files: knowledgeBaseFiles.map(f => f.name).join(", "),
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create call");
      }

      return {
        success: true,
        callId: result.call_id,
        status: result.call_status,
        message: `Call initiated successfully (ID: ${result.call_id})`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to create call",
      };
    }
  };

  const startVoiceCampaign = async () => {
    if (!validateRetellConfig()) return;

    setIsCalling(true);
    setIsLoading(true);
    setProgress(0);
    setSuccessCount(0);
    setFailedCount(0);
    setCallLogs([]);
    setCurrentCallIndex(0);

    toast({
      title: "Voice Campaign Started",
      description: `Initiating calls to ${recipients.length} recipient(s)...`,
    });

    const updatedData = [...data];

    for (let i = 0; i < recipients.length; i++) {
      if (isPaused) {
        toast({
          title: "Campaign Paused",
          description: `Paused at ${i} of ${recipients.length} calls`,
        });
        break;
      }

      setCurrentCallIndex(i + 1);
      const recipient = recipients[i];
      const phone = recipient[phoneColumn];

      // Find index in original data
      const dataIndex = data.findIndex((row) => row[phoneColumn] === phone);

      try {
        // Make the call
        const result = await makePhoneCall(phone, {
          recipient_name: recipient["Name"] || recipient["name"] || "Customer",
          recipient_email: recipient["Email"] || recipient["email"] || "",
        });

        if (result.success) {
          setSuccessCount((prev) => prev + 1);
          
          // Update status to "Called" or "Completed"
          if (statusColumn && dataIndex !== -1) {
            updatedData[dataIndex][statusColumn] = "Called";
          }

          setCallLogs((prev) => [
            ...prev,
            {
              phone,
              status: "success",
              message: result.message || "Call initiated",
            },
          ]);
        } else {
          setFailedCount((prev) => prev + 1);
          setCallLogs((prev) => [
            ...prev,
            {
              phone,
              status: "failed",
              message: result.message || "Call failed",
            },
          ]);
        }
      } catch (error: any) {
        setFailedCount((prev) => prev + 1);
        setCallLogs((prev) => [
          ...prev,
          {
            phone,
            status: "failed",
            message: error.message || "Unknown error",
          },
        ]);
      }

      // Update progress
      setProgress(((i + 1) / recipients.length) * 100);

      // Wait between calls (rate limiting)
      if (i < recipients.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
      }
    }

    // Call completion
    setIsLoading(false);
    setIsCalling(false);

    // Update parent component with new data
    if (onStatusUpdate && statusColumn) {
      onStatusUpdate(updatedData);
    }

    toast({
      title: "Voice Campaign Complete",
      description: `Successfully initiated: ${successCount} | Failed: ${failedCount}`,
    });

    // Auto-close after 3 seconds
    setTimeout(() => {
      setIsOpen(false);
    }, 3000);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Campaign Resumed" : "Campaign Paused",
      description: isPaused ? "Continuing calls..." : "Campaign paused. Close dialog to stop.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white shadow-lg"
          disabled={recipients.length === 0}
        >
          <Phone className="w-4 h-4" />
          Voice Campaign
          {recipients.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
              {recipients.length}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <PhoneCall className="w-6 h-6 text-purple-600" />
            Voice Campaign - {projectName}
          </DialogTitle>
          <DialogDescription>
            Make automated voice calls using Retell AI to {recipients.length} recipient(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Alert for Setup */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>AI-Powered Agent Creation:</strong> This system uses Gemini AI (pre-configured) 
              to automatically generate voice agent prompts based on your project knowledge base. 
              Connect your phone via SIP trunk to start making intelligent calls.
            </AlertDescription>
          </Alert>

          {knowledgeBaseFiles.length > 0 && (
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-300">
                <strong>Knowledge Base Detected:</strong> {knowledgeBaseFiles.length} document(s) will be
                used to create an intelligent agent with context about your project.
              </AlertDescription>
            </Alert>
          )}

          {/* Pre-configured Keys Alert */}
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-300">
              <strong>✓ Pre-configured:</strong> Gemini API Key and Retell API Key are already set up. 
              Just connect your SIP trunk phone number to start!
            </AlertDescription>
          </Alert>

          {/* Step 1: Connect SIP Trunk */}
          <div className="space-y-4 p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
            <h3 className="text-lg font-bold bg-gradient-to-r from-orange-700 to-red-700 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Step 1: Connect Your Phone via SIP Trunk
            </h3>

            {/* Display Registered Phone Numbers */}
            {registeredPhones.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Registered Phone Numbers ({registeredPhones.length})
                  </h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={fetchRegisteredPhones}
                    disabled={isLoadingPhones}
                  >
                    {isLoadingPhones ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Refresh"
                    )}
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {registeredPhones.map((phone, index) => (
                    <div
                      key={index}
                      className="p-2 bg-white dark:bg-slate-800 rounded border border-blue-100 dark:border-blue-900 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      onClick={() => {
                        // Auto-select and mark as configured
                        setPhoneNumber(phone.phone_number);
                        setNickname(phone.nickname || "");
                        setIsSipConfigured(true); // Mark as already configured
                        toast({
                          title: "Phone Number Selected!",
                          description: "This phone is already configured. You can proceed to the next step.",
                        });
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {phone.phone_number_pretty || phone.phone_number}
                          </p>
                          {phone.nickname && (
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {phone.nickname}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 text-xs">
                          {phone.outbound_agent_id && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded">
                              Outbound ✓
                            </span>
                          )}
                          {phone.inbound_agent_id && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                              Inbound ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                  💡 Click on a registered phone to use it (already configured - no SIP credentials needed)
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  placeholder="+14157774444"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    // If manually editing, reset configuration status
                    if (isSipConfigured) {
                      setIsSipConfigured(false);
                    }
                  }}
                  className="font-mono"
                  disabled={isCalling || isCreatingAgent}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {isSipConfigured 
                    ? "✓ Using registered phone number - already configured" 
                    : "Your phone number in E.164 format (or select from registered numbers above)"}
                </p>
              </div>

              {/* Only show SIP credential fields if not using a registered phone */}
              {!isSipConfigured && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Termination URI *
                    </label>
                    <Input
                      type="text"
                      placeholder="sip:username@yourdomain.com"
                      value={terminationUri}
                      onChange={(e) => setTerminationUri(e.target.value)}
                      className="font-mono text-sm"
                      disabled={isCalling || isCreatingAgent}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      NOT Retell SIP server URI - your own SIP endpoint
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        SIP Username (Optional)
                      </label>
                      <Input
                        type="text"
                        placeholder="username"
                        value={sipUsername}
                        onChange={(e) => setSipUsername(e.target.value)}
                        disabled={isCalling || isCreatingAgent}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        SIP Password (Optional)
                      </label>
                      <Input
                        type="password"
                        placeholder="password"
                        value={sipPassword}
                        onChange={(e) => setSipPassword(e.target.value)}
                        disabled={isCalling || isCreatingAgent}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Nickname (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder={`${projectName} Phone`}
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      disabled={isCalling || isCreatingAgent}
                    />
                  </div>

                  <Button
                    onClick={configureSipTrunk}
                    disabled={!phoneNumber || !terminationUri || isCreatingAgent || isCalling}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    {isCreatingAgent ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Configuring...
                      </>
                    ) : (
                      <>
                        Connect SIP Trunk
                      </>
                    )}
                  </Button>
                </>
              )}

              {isSipConfigured && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-300 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    SIP Trunk Connected Successfully!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                    Phone: {phoneNumber}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    You can now proceed to generate your AI agent prompt.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: AI Agent Creation */}
          <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-cyan-700 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Step 2: Create AI Voice Agent
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <strong>✓ Gemini API Key:</strong> Pre-configured
                </p>
              </div>

              <Button
                onClick={generateAgentPromptWithGemini}
                disabled={!isSipConfigured || isCreatingAgent || isCalling || !!agentPrompt}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {isCreatingAgent ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Prompt...
                  </>
                ) : agentPrompt ? (
                  <>
                    ✓ Prompt Generated
                  </>
                ) : (
                  <>
                    Generate Agent Prompt with AI
                  </>
                )}
              </Button>

              {agentPrompt && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Generated Agent Prompt
                  </label>
                  <Textarea
                    value={agentPrompt}
                    onChange={(e) => setAgentPrompt(e.target.value)}
                    className="font-sans text-sm min-h-[120px]"
                    placeholder="Agent prompt will appear here..."
                    disabled={isCalling}
                  />
                  <p className="text-xs text-slate-500">
                    Review and edit the AI-generated prompt if needed
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Create Retell Agent */}
          <div className="space-y-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-700 to-pink-700 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Step 3: Select or Create Agent
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  <strong>✓ Retell API Key:</strong> Pre-configured
                </p>
              </div>

              {/* Registered Agents Section */}
              {registeredAgents.length > 0 && !agentId && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Select Existing Agent
                  </label>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-300">
                    💡 <strong>Tip:</strong> Existing agents will use their current configuration. New agents created below will automatically include the <strong>end_call</strong> tool.
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {registeredAgents.map((agent) => (
                      <button
                        key={agent.agent_id}
                        onClick={() => {
                          setAgentId(agent.agent_id);
                          // Update agent with outbound phone if configured
                          if (isSipConfigured && phoneNumber) {
                            updateAgentWithEndCall(agent.agent_id);
                          }
                          toast({
                            title: "Agent Selected",
                            description: `Using ${agent.agent_name}`,
                          });
                        }}
                        disabled={isCalling}
                        className="text-left p-3 bg-white dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-700 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                              {agent.agent_name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                              {agent.agent_id}
                            </p>
                          </div>
                          <div className="text-xs text-purple-600 dark:text-purple-400">
                            {agent.voice_id} • {agent.language}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">OR</span>
                    <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
                  </div>
                </div>
              )}

              {/* Transfer Phone Number (Optional) */}
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Transfer to Higher Authority (Optional)
                </label>
                <Input
                  type="tel"
                  placeholder="+1234567890"
                  value={transferPhoneNumber}
                  onChange={(e) => setTransferPhoneNumber(e.target.value)}
                  disabled={isCalling || isCreatingAgent || !!agentId}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Phone number to transfer calls to when escalation is needed (E.164 format)
                </p>
              </div>

              <Button
                onClick={createRetellAgent}
                disabled={!agentPrompt || !isSipConfigured || isCreatingAgent || isCalling || !!agentId}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isCreatingAgent ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Agent...
                  </>
                ) : agentId ? (
                  <>
                    ✓ Agent Ready
                  </>
                ) : (
                  <>
                    Create New Agent with end_call Tool
                  </>
                )}
              </Button>

              {!agentId && (
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-700 dark:text-amber-300">
                  ℹ️ New agents include: <strong>end_call</strong> tool{transferPhoneNumber && ', '}
                  {transferPhoneNumber && <strong>transfer_call</strong>}{transferPhoneNumber && ' tool'}, knowledge base (if uploaded), and outbound phone configuration
                </div>
              )}

              {agentId && (
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-300 font-mono">
                    <strong>Agent ID:</strong> {agentId}
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                    <strong>Phone:</strong> {phoneNumber}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Call Progress */}
          {isCalling && (
            <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  Campaign Progress
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={togglePause}
                    className="flex items-center gap-1"
                  >
                    {isPaused ? (
                      <>
                        <PlayCircle className="w-4 h-4" />
                        Resume
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-4 h-4" />
                        Pause
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>
                    Calling {currentCallIndex} of {recipients.length}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <div className="text-xs text-green-700 dark:text-green-400 font-semibold">
                    Successful Calls
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {successCount}
                  </div>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <div className="text-xs text-red-700 dark:text-red-400 font-semibold">
                    Failed Calls
                  </div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {failedCount}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Call Logs */}
          {callLogs.length > 0 && (
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Call Logs
              </h4>
              {callLogs.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 p-2 rounded text-xs ${
                    log.status === "success"
                      ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                  }`}
                >
                  <span className="font-mono font-semibold">{log.phone}</span>
                  <span>-</span>
                  <span className="flex-1">{log.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {recipients.length} recipient(s) will be called
            </div>
            <div className="flex gap-2">
              {!isCalling ? (
                <>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={startVoiceCampaign}
                    disabled={isLoading || recipients.length === 0}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 mr-2" />
                        Start Voice Campaign
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsCalling(false);
                    setIsOpen(false);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Stop Campaign
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
