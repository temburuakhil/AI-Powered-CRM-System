import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Sparkles, Send, Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Gemini API Key stored in project
const GEMINI_API_KEY = "AIzaSyD7vSRpYuUElu_2FcvQYhVPRnmXAAbPG_A";

interface EmailCampaignProps {
  data: Record<string, any>[];
  statusColumn: string;
  emailColumn: string;
  onStatusUpdate: (updatedData: Record<string, any>[]) => void;
  projectName?: string;
  knowledgeBaseFiles?: Array<{ name: string; size: number; type: string; data: string }>;
  sheetUrl?: string;
}

export const EmailCampaign = ({ 
  data, 
  statusColumn, 
  emailColumn,
  onStatusUpdate,
  projectName = "New Project",
  knowledgeBaseFiles = [],
  sheetUrl
}: EmailCampaignProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState({
    host: "smtp.gmail.com",
    port: "587",
    user: "temburuakhil@gmail.com",
    password: "lvdw vemj mfrf hers",
  });
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState<{
    total: number;
    sent: number;
    failed: number;
  }>({ total: 0, sent: 0, failed: 0 });

  // Get recipients (Not Completed status)
  const recipients = data.filter(
    (row) => 
      row[statusColumn]?.toString().toLowerCase() !== "completed" &&
      row[emailColumn] &&
      row[emailColumn].includes("@")
  );

  const generateEmailContent = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
                    text: `Generate a professional email to notify employees about a new project assignment.
                    
                    Context: 
                    - Project Name: ${projectName}
                    - Employees need to be informed about this new project
                    - The email includes attached knowledge base files for reference
                    - ${knowledgeBaseFiles.length > 0 ? `Attached files: ${knowledgeBaseFiles.map(f => f.name).join(', ')}` : 'Project documentation is attached'}
                    
                    Please provide:
                    1. A professional and engaging subject line (max 60 characters) that mentions the new project
                    2. A well-structured email body (250-350 words) that:
                       - Announces the new project "${projectName}" with enthusiasm
                       - Explains that they have been assigned to this project
                       - Mentions that important project documents and knowledge base files are attached
                       - Encourages them to review the attached materials
                       - Asks them to acknowledge receipt and confirm their availability
                       - Includes a clear call-to-action (e.g., "Please review and respond within 24 hours")
                       - Maintains a professional yet encouraging tone
                       - Ends with appropriate closing remarks
                    
                    Format the response as:
                    SUBJECT: [subject line]
                    BODY: [email body with proper formatting including line breaks]`
                  }
                ]
              }
            ]
          }),
        }
      );

      const result = await response.json();
      console.log('Gemini API Response:', result);
      
      if (!response.ok) {
        throw new Error(result.error?.message || `API Error: ${response.status}`);
      }
      
      if (result.candidates && result.candidates[0]) {
        const generatedText = result.candidates[0].content.parts[0].text;
        console.log('Generated Text:', generatedText);
        
        // Parse subject and body
        const subjectMatch = generatedText.match(/SUBJECT:\s*(.+?)(?=\n|BODY:)/s);
        const bodyMatch = generatedText.match(/BODY:\s*(.+)/s);
        
        if (subjectMatch && bodyMatch) {
          setEmailSubject(subjectMatch[1].trim());
          setEmailBody(bodyMatch[1].trim());
          
          toast({
            title: "Content Generated!",
            description: "AI-powered email content is ready to send",
          });
        } else {
          // If parsing fails, try to use the full text
          console.log('Parsing failed, using full text');
          const lines = generatedText.split('\n').filter((l: string) => l.trim());
          if (lines.length >= 2) {
            setEmailSubject(lines[0].replace(/^(SUBJECT:|Subject:)/i, '').trim());
            setEmailBody(lines.slice(1).join('\n').replace(/^(BODY:|Body:)/i, '').trim());
            toast({
              title: "Content Generated!",
              description: "AI-powered email content is ready to send",
            });
          } else {
            throw new Error("Failed to parse generated content");
          }
        }
      } else {
        const errorMsg = result.error?.message || "No content generated";
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate email content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmails = async () => {
    if (!smtpConfig.user || !smtpConfig.password) {
      toast({
        title: "SMTP Configuration Required",
        description: "Please enter your email credentials",
        variant: "destructive",
      });
      return;
    }

    if (!emailSubject.trim() || !emailBody.trim()) {
      toast({
        title: "Email Content Required",
        description: "Please generate or enter email subject and body",
        variant: "destructive",
      });
      return;
    }

    if (recipients.length === 0) {
      toast({
        title: "No Recipients",
        description: "No incomplete records found to send emails to",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    setSendProgress({ total: recipients.length, sent: 0, failed: 0 });

    try {
      // Using EmailJS or similar service (you'll need to set this up)
      // For now, we'll simulate the sending process
      
      const updatedData = [...data];
      let sentCount = 0;
      let failedCount = 0;

      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        
        try {
          // Send email via backend with attachments
          const emailPayload = {
            to: recipient[emailColumn],
            subject: emailSubject,
            body: emailBody,
            from: smtpConfig.user,
            smtp: {
              host: smtpConfig.host,
              port: smtpConfig.port,
              user: smtpConfig.user,
              password: smtpConfig.password,
            },
            attachments: knowledgeBaseFiles.map(file => ({
              filename: file.name,
              content: file.data, // base64 encoded data
              encoding: 'base64'
            })),
            projectName: projectName
          };

          // Send to backend for actual email sending
          const response = await fetch('http://localhost:3001/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailPayload),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Email send failed');
          }

          // Update status to "Completed" in the data
          const dataIndex = updatedData.findIndex(
            (row) => row[emailColumn] === recipient[emailColumn]
          );
          
          if (dataIndex !== -1) {
            updatedData[dataIndex][statusColumn] = "Completed";
          }

          sentCount++;
          setSendProgress({ total: recipients.length, sent: sentCount, failed: failedCount });
          
        } catch (error) {
          console.error(`Failed to send email to ${recipient[emailColumn]}:`, error);
          failedCount++;
          setSendProgress({ total: recipients.length, sent: sentCount, failed: failedCount });
        }
      }

      // Update the data in parent component
      onStatusUpdate(updatedData);

      // Auto-update Google Sheets if sheetUrl is provided
      if (sentCount > 0 && sheetUrl) {
        try {
          console.log('Attempting to update Google Sheets...');
          const sheetUpdateResponse = await fetch('http://localhost:3001/api/update-sheet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sheetUrl: sheetUrl,
              updates: updatedData
                .filter((row) => row[statusColumn] === "Completed")
                .map((row) => ({
                  email: row[emailColumn],
                  statusColumn: statusColumn,
                  newStatus: "Completed"
                }))
            }),
          });

          if (sheetUpdateResponse.ok) {
            console.log('Google Sheets updated successfully');
            toast({
              title: "Sheets Updated!",
              description: "Google Sheets has been updated with completed statuses.",
            });
          } else {
            console.log('Sheet update not available - manual update required');
          }
        } catch (sheetError) {
          console.log('Sheet auto-update skipped:', sheetError);
          // Don't show error to user - this is optional functionality
        }
      }

      toast({
        title: "Campaign Complete!",
        description: `Successfully sent ${sentCount} emails. ${failedCount} failed.`,
      });

      if (sentCount > 0) {
        setTimeout(() => {
          setIsOpen(false);
        }, 2000);
      }

    } catch (error) {
      console.error("Error sending emails:", error);
      toast({
        title: "Send Failed",
        description: "Failed to send emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Mail className="w-4 h-4 mr-2" />
          Email Campaign
          {recipients.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {recipients.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Mail className="w-6 h-6 text-purple-600" />
            Email Campaign Setup
          </DialogTitle>
          <DialogDescription>
            Send AI-generated emails to {recipients.length} recipients with "Not Completed" status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* AI Content Generation */}
          <div className="flex justify-end mb-2">
            <Button
              onClick={generateEmailContent}
              disabled={isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Email Content with AI
                </>
              )}
            </Button>
          </div>

          {/* SMTP Configuration */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <Send className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-lg">SMTP Configuration</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Email Address</label>
                <Input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={smtpConfig.user}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">App Password</label>
                <Input
                  type="password"
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={smtpConfig.password}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">
                  For Gmail, use an{" "}
                  <a
                    href="https://support.google.com/accounts/answer/185833"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    App Password
                  </a>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">SMTP Host</label>
                <Input
                  value={smtpConfig.host}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Port</label>
                <Input
                  value={smtpConfig.port}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                />
              </div>
            </div>
          </Card>

          {/* Email Content */}
          <Card className="p-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-lg">Email Content</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Subject</label>
                <Input
                  placeholder="Email subject line"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Body</label>
                <Textarea
                  placeholder="Email body content"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  className="font-sans"
                />
              </div>
            </div>
          </Card>

          {/* Recipients Info */}
          <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <span className="font-medium">Recipients:</span>
              <span className="text-2xl font-bold text-purple-600">{recipients.length}</span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Status will be updated to "Completed" after sending
            </div>
          </div>

          {/* Send Progress */}
          {isSending && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Sending Progress</span>
                  <span className="text-sm">
                    {sendProgress.sent} / {sendProgress.total}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(sendProgress.sent / sendProgress.total) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Sent: {sendProgress.sent}
                  </div>
                  {sendProgress.failed > 0 && (
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircle className="w-4 h-4" />
                      Failed: {sendProgress.failed}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Send Button */}
          <Button
            onClick={sendEmails}
            disabled={isSending || !emailSubject || !emailBody || !smtpConfig.user || !smtpConfig.password || recipients.length === 0}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 h-12 text-lg"
          >
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending Emails...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send to {recipients.length} Recipients
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
