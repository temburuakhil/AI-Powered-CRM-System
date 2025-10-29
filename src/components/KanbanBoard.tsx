import { useState, useEffect } from "react";
import { X, Plus, GripVertical, Trash2, CheckCircle2, UserPlus, Sparkles, Loader2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  columnId: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  calendarEventId?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface KanbanBoardProps {
  projectId: string;
  managerId: string;
  isOpen: boolean;
  onClose: () => void;
  data?: any[];
}

export const KanbanBoard = ({ projectId, managerId, isOpen, onClose, data = [] }: KanbanBoardProps) => {
  const storageKey = `kanban_${managerId}_${projectId}`;
  
  const [columns, setColumns] = useState<Column[]>([
    { id: "todo", title: "TO DO", tasks: [] },
    { id: "inprogress", title: "IN PROGRESS", tasks: [] },
    { id: "done", title: "DONE", tasks: [] },
  ]);
  
  const [newTaskColumn, setNewTaskColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [showCustomAssignee, setShowCustomAssignee] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  
  // Edit task state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskAssignee, setEditTaskAssignee] = useState("");
  const [editTaskStartDate, setEditTaskStartDate] = useState("");
  const [editTaskStartTime, setEditTaskStartTime] = useState("");
  const [editTaskEndDate, setEditTaskEndDate] = useState("");
  const [editTaskEndTime, setEditTaskEndTime] = useState("");
  const [showEditCustomAssignee, setShowEditCustomAssignee] = useState(false);
  
  const { toast } = useToast();
  const geminiApiKey = "AIzaSyD7vSRpYuUElu_2FcvQYhVPRnmXAAbPG_A";
  const [calendarEnabled, setCalendarEnabled] = useState(false);

  // Check calendar integration status
  useEffect(() => {
    const checkCalendarStatus = async () => {
      try {
        console.log('🔍 Checking calendar status...');
        const response = await fetch("http://localhost:3001/api/calendar-status");
        
        if (!response.ok) {
          console.error('❌ Calendar status check failed:', response.status, response.statusText);
          setCalendarEnabled(false);
          return;
        }
        
        const data = await response.json();
        console.log('📅 Calendar status response:', data);
        
        const isEnabled = data.enabled && data.authenticated;
        setCalendarEnabled(isEnabled);
        
        if (isEnabled) {
          console.log('✅ Google Calendar integration is ENABLED and authenticated');
        } else if (!data.authenticated) {
          console.log("⚠️ Calendar integration not authenticated. Visit http://localhost:3001/google-calendar-setup");
        } else if (!data.enabled) {
          console.log("⚠️ Calendar integration disabled in backend");
        }
      } catch (error) {
        console.error("❌ Calendar service unavailable:", error);
        setCalendarEnabled(false);
      }
    };
    
    checkCalendarStatus();
  }, []);

  // Extract unique names from data
  const availableAssignees = Array.from(
    new Set(
      data
        .map(row => {
          // Try to find name column (case-insensitive)
          const nameKey = Object.keys(row).find(key => 
            key.toLowerCase().includes('name')
          );
          return nameKey ? String(row[nameKey]).trim() : null;
        })
        .filter((name): name is string => name !== null && name !== '')
    )
  ).sort();

  // Load kanban data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsedData = JSON.parse(stored);
        console.log('📂 Loaded kanban data from localStorage:', parsedData);
        setColumns(parsedData);
      } catch (error) {
        console.error("Error loading kanban data:", error);
      }
    } else {
      console.log('ℹ️ No stored kanban data found');
    }
  }, [storageKey]);

  // Save kanban data to localStorage
  const saveToLocalStorage = (updatedColumns: Column[]) => {
    localStorage.setItem(storageKey, JSON.stringify(updatedColumns));
  };

  const addTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription,
      assignee: newTaskAssignee,
      columnId,
    };

    const updatedColumns = columns.map((col) =>
      col.id === columnId
        ? { ...col, tasks: [...col.tasks, newTask] }
        : col
    );

    setColumns(updatedColumns);
    saveToLocalStorage(updatedColumns);
    
    // Reset form
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskAssignee("");
    setShowCustomAssignee(false);
    setNewTaskColumn(null);
  };

  const deleteTask = (taskId: string, columnId: string) => {
    const updatedColumns = columns.map((col) =>
      col.id === columnId
        ? { ...col, tasks: col.tasks.filter((task) => task.id !== taskId) }
        : col
    );

    setColumns(updatedColumns);
    saveToLocalStorage(updatedColumns);
  };

  // Open edit dialog
  const openEditTask = (task: Task) => {
    console.log('📝 Opening task for edit:');
    console.log('  Title:', task.title);
    console.log('  Assignee:', task.assignee);
    console.log('  Start Date:', task.startDate);
    console.log('  Start Time:', task.startTime);
    console.log('  End Date:', task.endDate);
    console.log('  End Time:', task.endTime);
    console.log('  Calendar Event ID:', task.calendarEventId);
    console.log('  Full task object:', JSON.stringify(task, null, 2));
    
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description || "");
    setEditTaskAssignee(task.assignee || "");
    setEditTaskStartDate(task.startDate || "");
    setEditTaskStartTime(task.startTime || "");
    setEditTaskEndDate(task.endDate || "");
    setEditTaskEndTime(task.endTime || "");
    setShowEditCustomAssignee(false);
  };

  // Save edited task
  const saveEditedTask = async () => {
    if (!editingTask || !editTaskTitle.trim()) return;

    const previousAssignee = editingTask.assignee;
    const newAssignee = editTaskAssignee;
    
    // Check if dates are provided for calendar event
    const shouldCreateCalendarEvent = editTaskStartDate && editTaskStartTime && editTaskEndDate && editTaskEndTime;
    let calendarEventId = editingTask.calendarEventId;

    console.log('💾 Saving task:');
    console.log('  Title:', editTaskTitle);
    console.log('  Assignee:', editTaskAssignee);
    console.log('  Start Date:', editTaskStartDate);
    console.log('  Start Time:', editTaskStartTime);
    console.log('  End Date:', editTaskEndDate);
    console.log('  End Time:', editTaskEndTime);

    const updatedColumns = columns.map((col) =>
      col.id === editingTask.columnId
        ? {
            ...col,
            tasks: col.tasks.map((t) =>
              t.id === editingTask.id
                ? {
                    ...t,
                    title: editTaskTitle,
                    description: editTaskDescription,
                    assignee: editTaskAssignee,
                    startDate: editTaskStartDate,
                    startTime: editTaskStartTime,
                    endDate: editTaskEndDate,
                    endTime: editTaskEndTime,
                    calendarEventId: calendarEventId,
                  }
                : t
            ),
          }
        : col
    );

    setColumns(updatedColumns);
    saveToLocalStorage(updatedColumns);
    
    console.log('✅ Task saved to localStorage');
    
    // Verify what was saved
    const savedTask = updatedColumns
      .find(col => col.id === editingTask.columnId)
      ?.tasks.find(t => t.id === editingTask.id);
    console.log('📋 Saved task data:', JSON.stringify(savedTask, null, 2));
    
    toast({
      title: "Task Updated",
      description: "Changes saved successfully",
    });

    // Send email if assignee changed and new assignee exists
    if (newAssignee && newAssignee !== previousAssignee && newAssignee !== '__unassigned__') {
      await sendTaskAssignmentEmail(editTaskTitle, editTaskDescription, newAssignee);
    }

    // Create Google Calendar event if dates are provided
    if (shouldCreateCalendarEvent && !calendarEventId) {
      console.log('Calendar event conditions met:', {
        shouldCreateCalendarEvent,
        calendarEventId,
        calendarEnabled,
        dates: {
          startDate: editTaskStartDate,
          startTime: editTaskStartTime,
          endDate: editTaskEndDate,
          endTime: editTaskEndTime
        }
      });
      
      if (calendarEnabled) {
        await createGoogleCalendarEvent(
          editTaskTitle,
          editTaskDescription,
          editTaskAssignee,
          editTaskStartDate,
          editTaskStartTime,
          editTaskEndDate,
          editTaskEndTime,
          editingTask.id
        );
      } else {
        console.warn('Calendar event not created: Calendar integration not enabled');
        toast({
          title: "⚠️ Calendar Not Configured",
          description: "Please set up Google Calendar integration to sync events",
          variant: "destructive",
        });
      }
    }

    // Close edit dialog
    setEditingTask(null);
    setEditTaskTitle("");
    setEditTaskDescription("");
    setEditTaskAssignee("");
    setEditTaskStartDate("");
    setEditTaskStartTime("");
    setEditTaskEndDate("");
    setEditTaskEndTime("");
    setShowEditCustomAssignee(false);
  };

  // Send task assignment email
  const sendTaskAssignmentEmail = async (
    taskTitle: string,
    taskDescription: string,
    assigneeName: string
  ) => {
    try {
      // Find assignee email from data
      const assigneeData = data.find((row) => {
        const nameKey = Object.keys(row).find(key => 
          key.toLowerCase().includes('name')
        );
        return nameKey && String(row[nameKey]).trim() === assigneeName;
      });

      if (!assigneeData) {
        console.log("No email found for assignee:", assigneeName);
        return;
      }

      // Find email column
      const emailKey = Object.keys(assigneeData).find(key => 
        key.toLowerCase().includes('email')
      );

      if (!emailKey || !assigneeData[emailKey]) {
        console.log("No email column found for:", assigneeName);
        return;
      }

      const assigneeEmail = assigneeData[emailKey];

      // Send email via backend
      const response = await fetch("http://localhost:3001/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: assigneeEmail,
          subject: `New Task Assigned: ${taskTitle}`,
          body: `Hello ${assigneeName},

You have been assigned a new task in the project management system.

Task Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: ${taskTitle}

Description: ${taskDescription || 'No description provided'}

Project: ${projectId}
Assigned Date: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please log in to the project management system to view full details and update the task status.

Best regards,
Project Management Team`,
          from: "noreply@projectmanagement.com",
          smtp: {
            host: "smtp.gmail.com",
            port: "587",
            user: "temburuakhil@gmail.com",
            password: "lvdw vemj mfrf hers",
          },
          projectName: `Project ${projectId}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Assignment Email Sent",
          description: `Notification sent to ${assigneeName}`,
        });
      }
    } catch (error) {
      console.error("Error sending assignment email:", error);
    }
  };

  // Send task completion email
  const sendTaskCompletionEmail = async (
    taskTitle: string,
    taskDescription: string,
    assigneeName: string
  ) => {
    try {
      const completionDate = new Date().toLocaleString();

      // Send email to admin
      const response = await fetch("http://localhost:3001/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "temburuakhil@gmail.com",
          subject: `✅ Task Completed: ${taskTitle}`,
          body: `Task Completion Notification

A task has been marked as completed in the project management system.

Task Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: ${taskTitle}

Description: ${taskDescription || 'No description provided'}

Completed By: ${assigneeName || 'Unassigned'}
Completion Date: ${completionDate}

Project: ${projectId}
Manager: ${managerId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This task has been successfully completed and moved to the DONE column.

Best regards,
Project Management System`,
          from: "noreply@projectmanagement.com",
          smtp: {
            host: "smtp.gmail.com",
            port: "587",
            user: "temburuakhil@gmail.com",
            password: "lvdw vemj mfrf hers",
          },
          projectName: `Project ${projectId}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("Completion notification sent to admin");
      }
    } catch (error) {
      console.error("Error sending completion email:", error);
    }
  };

  // Create Google Calendar Event
  const createGoogleCalendarEvent = async (
    taskTitle: string,
    taskDescription: string,
    assigneeName: string,
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string,
    taskId: string
  ) => {
    try {
      // Find assignee email from data
      let attendeeEmail = "";
      if (assigneeName) {
        const assigneeData = data.find((row) => {
          const nameKey = Object.keys(row).find(key => 
            key.toLowerCase().includes('name')
          );
          return nameKey && String(row[nameKey]).trim() === assigneeName;
        });

        if (assigneeData) {
          const emailKey = Object.keys(assigneeData).find(key => 
            key.toLowerCase().includes('email')
          );
          if (emailKey) {
            attendeeEmail = assigneeData[emailKey];
          }
        }
      }

      // Combine date and time to create proper ISO datetime strings with timezone
      // Format: YYYY-MM-DDTHH:mm:ss (will be sent to backend which adds timezone)
      const startDateTime = `${startDate}T${startTime}:00`;
      const endDateTime = `${endDate}T${endTime}:00`;
      
      // Get local timezone
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      console.log('Creating calendar event:', {
        startDateTime,
        endDateTime,
        timeZone
      });

      // Create calendar event via backend
      const response = await fetch("http://localhost:3001/api/create-calendar-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: taskTitle,
          description: `${taskDescription || 'No description provided'}\n\nAssigned to: ${assigneeName || 'Unassigned'}\nProject: ${projectId}\nManager: ${managerId}`,
          startDateTime: startDateTime,
          endDateTime: endDateTime,
          attendeeEmail: attendeeEmail,
          timeZone: timeZone,
        }),
      });

      const result = await response.json();
      console.log("Calendar API response:", result);

      if (result.success) {
        // Update task with calendar event ID while preserving all other data
        setColumns(prevColumns => {
          const updatedColumns = prevColumns.map((col) => ({
            ...col,
            tasks: col.tasks.map((t) =>
              t.id === taskId
                ? { ...t, calendarEventId: result.eventId }
                : t
            ),
          }));
          
          saveToLocalStorage(updatedColumns);
          
          // Log the updated task to verify
          const updatedTask = updatedColumns
            .flatMap(col => col.tasks)
            .find(t => t.id === taskId);
          console.log('📅 Task after calendar sync:', JSON.stringify(updatedTask, null, 2));
          
          return updatedColumns;
        });

        toast({
          title: "✅ Calendar Event Created",
          description: `Event synced to Google Calendar${result.meetLink ? ' with Google Meet link' : ''}`,
        });
      } else {
        console.error("Calendar creation failed:", result);
        
        // Check if needs re-authentication
        if (result.needsReauth) {
          toast({
            title: "⚠️ Calendar Setup Required",
            description: "Visit http://localhost:3001/google-calendar-setup to connect",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Calendar Event Failed",
            description: result.message || result.error || "Could not create calendar event",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error creating calendar event:", error);
      toast({
        title: "Calendar Error",
        description: "Failed to create Google Calendar event",
        variant: "destructive",
      });
    }
  };

  const moveTask = (taskId: string, fromColumnId: string, toColumnId: string) => {
    if (fromColumnId === toColumnId) return;

    const task = columns
      .find((col) => col.id === fromColumnId)
      ?.tasks.find((t) => t.id === taskId);

    if (!task) return;

    const updatedColumns = columns.map((col) => {
      if (col.id === fromColumnId) {
        return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
      }
      if (col.id === toColumnId) {
        return { ...col, tasks: [...col.tasks, { ...task, columnId: toColumnId }] };
      }
      return col;
    });

    setColumns(updatedColumns);
    saveToLocalStorage(updatedColumns);

    // Show completion animation and send email if moved to DONE
    if (toColumnId === "done" && fromColumnId !== "done") {
      setCompletedTasks(prev => new Set(prev).add(taskId));
      setTimeout(() => {
        setCompletedTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      }, 2000);
      
      // Send completion email to admin
      sendTaskCompletionEmail(
        task.title,
        task.description || '',
        task.assignee || 'Unassigned'
      );
    }
  };

  // Reorder task within same column or move to different position in another column
  const reorderTask = (
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    const task = columns
      .find((col) => col.id === fromColumnId)
      ?.tasks.find((t) => t.id === taskId);

    if (!task) return;

    const updatedColumns = columns.map((col) => {
      // Remove from source column
      if (col.id === fromColumnId) {
        const filteredTasks = col.tasks.filter((t) => t.id !== taskId);
        
        // If same column, insert at new position
        if (fromColumnId === toColumnId) {
          const newTasks = [...filteredTasks];
          // Adjust index if dragging down within same column
          const insertIndex = fromIndex < toIndex ? toIndex : toIndex;
          newTasks.splice(insertIndex, 0, task);
          return { ...col, tasks: newTasks };
        }
        
        return { ...col, tasks: filteredTasks };
      }
      
      // Add to target column at specific position
      if (col.id === toColumnId && fromColumnId !== toColumnId) {
        const newTasks = [...col.tasks];
        newTasks.splice(toIndex, 0, { ...task, columnId: toColumnId });
        return { ...col, tasks: newTasks };
      }
      
      return col;
    });

    setColumns(updatedColumns);
    saveToLocalStorage(updatedColumns);

    // Show completion animation and send email if moved to DONE
    if (toColumnId === "done" && fromColumnId !== "done") {
      setCompletedTasks(prev => new Set(prev).add(taskId));
      setTimeout(() => {
        setCompletedTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      }, 2000);
      
      // Send completion email to admin
      sendTaskCompletionEmail(
        task.title,
        task.description || '',
        task.assignee || 'Unassigned'
      );
    }
  };

  // AI Task Generation with Gemini
  const generateTasksWithAI = async () => {
    setIsGeneratingTasks(true);

    try {
      // Get knowledge base files from localStorage
      const kbKey = `kb_${managerId}_${projectId}`;
      const kbFiles = localStorage.getItem(kbKey);
      const knowledgeBaseContent = kbFiles ? JSON.parse(kbFiles) : [];

      // Check if knowledge base exists
      if (knowledgeBaseContent.length === 0) {
        toast({
          title: "No Knowledge Base",
          description: "Please upload knowledge base files to generate relevant tasks",
          variant: "destructive",
        });
        setIsGeneratingTasks(false);
        return;
      }

      // Extract text content from knowledge base files
      let contextInfo = "Project Knowledge Base:\n\n";
      
      for (const file of knowledgeBaseContent) {
        contextInfo += `File: ${file.name} (${file.type})\n`;
        
        // Decode base64 content for text files
        if (file.type === 'text/plain' && file.content) {
          try {
            const textContent = atob(file.content);
            contextInfo += `Content:\n${textContent.substring(0, 3000)}\n\n`;
          } catch (e) {
            console.error("Error decoding file:", e);
          }
        } else if (file.content) {
          // For other files, just mention they exist
          contextInfo += `[Binary file - PDF/Document uploaded for reference]\n\n`;
        }
      }

      // Create the Gemini prompt - ONLY based on knowledge base
      const fullPrompt = `You are an expert project management assistant. Based ONLY on the knowledge base files provided below, generate exactly 5 specific, actionable tasks for managing this project.

${contextInfo}

IMPORTANT INSTRUCTIONS:
1. Read and analyze the content of the uploaded files carefully
2. Generate tasks that are directly relevant to what's described in the documents
3. DO NOT make assumptions about data from Google Sheets or external sources
4. Focus ONLY on the project/initiative described in the knowledge base files
5. Generate EXACTLY 5 tasks - no more, no less

For each task, provide:
1. A clear, concise title (max 60 characters)
2. A detailed description (2-3 sentences explaining what needs to be done based on the document content)
3. Leave assignee empty (user will assign manually)
4. Which column it should start in:
   - "todo" for tasks that need to be started
   - "inprogress" for tasks that might be already underway
   - "done" for any completed items mentioned in documents

Examples of good tasks based on document content:
- "Review project eligibility criteria" - based on eligibility section in brochure
- "Prepare documentation requirements checklist" - based on required documents list
- "Schedule stakeholder information sessions" - based on outreach mentioned
- "Set up application tracking system" - based on application process described
- "Create FAQ document from brochure content" - based on key information

Return ONLY a valid JSON array with this exact structure (no additional text):
[
  {
    "title": "Task title directly from document content",
    "description": "Detailed description referencing specific aspects from the uploaded files",
    "assignee": "",
    "column": "todo"
  }
]`;

      console.log("Generating tasks with Gemini based on knowledge base...");

      // Call Gemini API using gemini-2.5-flash model
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
                    text: fullPrompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 4096,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", errorText);
        throw new Error(`Gemini API error (${response.status}): ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();
      console.log("Gemini response:", result);

      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error("No content generated by AI");
      }

      // Extract JSON from response (handle markdown code blocks)
      let tasksJson = generatedText.trim();
      if (tasksJson.startsWith("```json")) {
        tasksJson = tasksJson.substring(7);
      }
      if (tasksJson.startsWith("```")) {
        tasksJson = tasksJson.substring(3);
      }
      if (tasksJson.endsWith("```")) {
        tasksJson = tasksJson.substring(0, tasksJson.length - 3);
      }
      
      const generatedTasks = JSON.parse(tasksJson.trim());

      if (!Array.isArray(generatedTasks) || generatedTasks.length === 0) {
        throw new Error("Invalid task format generated");
      }

      // Add generated tasks to columns
      const updatedColumns = [...columns];
      
      generatedTasks.forEach((taskData: any) => {
        const columnId = taskData.column || "todo";
        const newTask: Task = {
          id: `task-${Date.now()}-${Math.random()}`,
          title: taskData.title || "Untitled Task",
          description: taskData.description || "",
          assignee: "", // Always empty - user will assign manually
          columnId: columnId,
        };

        const columnIndex = updatedColumns.findIndex(col => col.id === columnId);
        if (columnIndex !== -1) {
          updatedColumns[columnIndex].tasks.push(newTask);
        }
      });

      setColumns(updatedColumns);
      saveToLocalStorage(updatedColumns);

      toast({
        title: "✨ 5 Tasks Generated!",
        description: `Created ${generatedTasks.length} tasks from your knowledge base. Click the edit icon on each task to assign team members.`,
      });

    } catch (error) {
      console.error("Error generating tasks:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate tasks with AI",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  const getColumnCount = (columnId: string) => {
    return columns.find((col) => col.id === columnId)?.tasks.length || 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] bg-[#0d1117] border-[#30363d] text-[#e6edf3] p-0 overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Project Board</DialogTitle>
        <DialogDescription className="sr-only">Manage project tasks across different stages</DialogDescription>
        
        {/* Custom Header */}
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#010409]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-[#e6edf3]" aria-hidden="true">Project Board</h2>
            <Button
              onClick={generateTasksWithAI}
              disabled={isGeneratingTasks}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm px-4 py-2 h-9"
            >
              {isGeneratingTasks ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Tasks with AI
                </>
              )}
            </Button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[#1c2128] transition-colors"
          >
            <X className="w-5 h-5 text-[#7d8590] hover:text-[#e6edf3]" />
          </button>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
          <div className="flex gap-6 min-w-max pb-4">
            {columns.map((column) => (
              <div
                key={column.id}
                className="flex-shrink-0 w-80 bg-[#010409] rounded-lg border border-[#30363d]"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('ring-2', 'ring-[#58a6ff]');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('ring-2', 'ring-[#58a6ff]');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('ring-2', 'ring-[#58a6ff]');
                  const taskId = e.dataTransfer.getData("taskId");
                  const fromColumnId = e.dataTransfer.getData("fromColumnId");
                  if (taskId && fromColumnId) {
                    moveTask(taskId, fromColumnId, column.id);
                  }
                }}
              >
                {/* Column Header */}
                <div className="px-4 py-3 border-b border-[#30363d]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-[#7d8590] uppercase tracking-wide">
                      {column.title}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-semibold bg-[#1c2128] text-[#7d8590] rounded-full">
                      {getColumnCount(column.id)}
                    </span>
                  </div>
                </div>

                {/* Tasks */}
                <div className="p-3 space-y-3 min-h-[400px] max-h-[500px] overflow-y-auto">
                  {column.tasks.map((task, index) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("taskId", task.id);
                        e.dataTransfer.setData("fromColumnId", column.id);
                        e.dataTransfer.setData("taskIndex", index.toString());
                        setDraggedTask(task.id);
                        e.currentTarget.classList.add('opacity-50');
                      }}
                      onDragEnd={(e) => {
                        setDraggedTask(null);
                        e.currentTarget.classList.remove('opacity-50');
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const draggedTaskId = e.dataTransfer.types.includes('text/plain') ? null : draggedTask;
                        if (draggedTaskId && draggedTaskId !== task.id) {
                          e.currentTarget.classList.add('border-t-2', 'border-t-[#58a6ff]');
                        }
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('border-t-2', 'border-t-[#58a6ff]');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove('border-t-2', 'border-t-[#58a6ff]');
                        
                        const draggedTaskId = e.dataTransfer.getData("taskId");
                        const fromColumnId = e.dataTransfer.getData("fromColumnId");
                        const fromIndex = parseInt(e.dataTransfer.getData("taskIndex"));
                        
                        if (draggedTaskId && draggedTaskId !== task.id) {
                          // Reorder within same column or move between columns
                          reorderTask(draggedTaskId, fromColumnId, column.id, fromIndex, index);
                        }
                      }}
                      className={`group bg-[#0d1117] border border-[#30363d] rounded-lg p-3 hover:border-[#58a6ff] transition-all cursor-move relative ${
                        completedTasks.has(task.id) ? 'animate-pulse ring-2 ring-green-500' : ''
                      }`}
                    >
                      {/* Completion Celebration */}
                      {completedTasks.has(task.id) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117]/90 rounded-lg z-10">
                          <div className="flex items-center gap-2 text-green-400 animate-bounce">
                            <CheckCircle2 className="w-6 h-6" />
                            <span className="text-sm font-semibold">Completed!</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <GripVertical className="w-4 h-4 text-[#7d8590] flex-shrink-0 cursor-grab active:cursor-grabbing" />
                          <p className="text-sm font-semibold text-[#e6edf3] line-clamp-2">
                            {task.title}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => openEditTask(task)}
                            className="p-1 hover:bg-blue-600/20 rounded transition-all flex-shrink-0"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id, column.id)}
                            className="p-1 hover:bg-red-600/20 rounded transition-all flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-[#7d8590] mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      {/* Assignee Display */}
                      {task.assignee && task.assignee !== '__unassigned__' && (
                        <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-[#1c2128] rounded-md border border-[#30363d]">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#58a6ff] to-[#1f6feb] flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-white">
                              {task.assignee.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-[#e6edf3]">{task.assignee}</span>
                        </div>
                      )}
                      
                      {/* Date and Time Display */}
                      {(task.startDate || task.endDate) && (
                        <div className="space-y-1.5 mb-2 px-2 py-2 bg-[#0d1117] rounded-md border border-[#21262d]">
                          {task.startDate && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-green-400 font-bold">▶</span>
                              <div className="flex flex-col">
                                <span className="text-[#7d8590] text-[10px] uppercase tracking-wide">Start</span>
                                <span className="text-[#e6edf3] font-medium">{task.startDate} {task.startTime}</span>
                              </div>
                            </div>
                          )}
                          {task.endDate && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-red-400 font-bold">⏹</span>
                              <div className="flex flex-col">
                                <span className="text-[#7d8590] text-[10px] uppercase tracking-wide">Deadline</span>
                                <span className="text-[#e6edf3] font-medium">{task.endDate} {task.endTime}</span>
                              </div>
                            </div>
                          )}
                          {task.calendarEventId && (
                            <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-[#30363d]">
                              <span className="text-sm">📅</span>
                              <span className="text-[10px] text-[#3fb950] font-medium uppercase tracking-wide">Synced to Google Calendar</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Task Form */}
                  {newTaskColumn === column.id ? (
                    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Input
                        placeholder="Task title..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newTaskTitle.trim()) {
                            addTask(column.id);
                          }
                        }}
                        className="bg-[#010409] border-[#30363d] text-[#e6edf3] text-sm"
                        autoFocus
                      />
                      <Textarea
                        placeholder="Description (optional)..."
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        className="bg-[#010409] border-[#30363d] text-[#e6edf3] text-sm min-h-[60px]"
                      />
                      {!showCustomAssignee ? (
                        <div className="relative">
                          <Select
                            value={newTaskAssignee}
                            onValueChange={(value) => {
                              if (value === '__custom__') {
                                setShowCustomAssignee(true);
                                setNewTaskAssignee('');
                              } else {
                                setNewTaskAssignee(value);
                              }
                            }}
                          >
                            <SelectTrigger className="bg-[#010409] border-[#30363d] text-[#e6edf3] text-sm">
                              <SelectValue placeholder="Select assignee..." />
                            </SelectTrigger>
                            <SelectContent className="bg-[#161b22] border-[#30363d]">
                              {availableAssignees.map((name) => (
                                <SelectItem
                                  key={name}
                                  value={name}
                                  className="text-[#e6edf3] focus:bg-[#21262d] focus:text-[#e6edf3]"
                                >
                                  {name}
                                </SelectItem>
                              ))}
                              <SelectItem
                                value="__custom__"
                                className="text-[#58a6ff] focus:bg-[#21262d] focus:text-[#58a6ff] border-t border-[#30363d] mt-1"
                              >
                                <div className="flex items-center gap-2">
                                  <UserPlus className="w-3.5 h-3.5" />
                                  <span>Add New...</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Input
                            placeholder="Enter assignee name..."
                            value={newTaskAssignee}
                            onChange={(e) => setNewTaskAssignee(e.target.value)}
                            className="bg-[#010409] border-[#30363d] text-[#e6edf3] text-sm"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              setShowCustomAssignee(false);
                              setNewTaskAssignee('');
                            }}
                            className="text-xs text-[#58a6ff] hover:underline"
                          >
                            ← Select from list
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => addTask(column.id)}
                          disabled={!newTaskTitle.trim()}
                          className="flex-1 bg-[#238636] hover:bg-[#2ea043] text-white text-sm h-8 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Task
                        </Button>
                        <Button
                          onClick={() => {
                            setNewTaskColumn(null);
                            setNewTaskTitle("");
                            setNewTaskDescription("");
                            setNewTaskAssignee("");
                          }}
                          variant="outline"
                          className="bg-[#21262d] border-[#30363d] hover:bg-[#30363d] hover:border-[#58a6ff] text-[#e6edf3] text-sm h-8"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setNewTaskColumn(column.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg hover:border-[#58a6ff] hover:bg-[#1c2128] transition-all text-[#7d8590] hover:text-[#e6edf3]"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-medium">Add Task</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>

      {/* Edit Task Dialog */}
      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] bg-[#0d1117] border-[#30363d] text-[#e6edf3] [&>button]:hidden p-0 overflow-hidden flex flex-col">
            <DialogTitle className="sr-only">Edit Task</DialogTitle>
            <DialogDescription className="sr-only">Update task details and assign team members</DialogDescription>
            
            <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#010409] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#e6edf3]" aria-hidden="true">Edit Task</h2>
                  <p className="text-sm text-[#7d8590]" aria-hidden="true">Update task details and assign team members</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1.5 rounded-md hover:bg-[#1c2128] transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5 text-[#7d8590] hover:text-[#e6edf3]" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Task Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e6edf3]">Task Title *</label>
                <Input
                  placeholder="Enter task title..."
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  className="bg-[#010409] border-[#30363d] text-[#e6edf3]"
                />
              </div>

              {/* Task Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e6edf3]">Description</label>
                <Textarea
                  placeholder="Enter task description..."
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                  className="bg-[#010409] border-[#30363d] text-[#e6edf3] min-h-[100px]"
                />
              </div>

              {/* Assignee Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e6edf3]">Assign To</label>
                {!showEditCustomAssignee ? (
                  <div className="relative">
                    <Select
                      value={editTaskAssignee || "__unassigned__"}
                      onValueChange={(value) => {
                        if (value === '__custom__') {
                          setShowEditCustomAssignee(true);
                          setEditTaskAssignee('');
                        } else if (value === '__unassigned__') {
                          setEditTaskAssignee('');
                        } else {
                          setEditTaskAssignee(value);
                        }
                      }}
                    >
                      <SelectTrigger className="bg-[#010409] border-[#30363d] text-[#e6edf3]">
                        <SelectValue placeholder="Select team member..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#161b22] border-[#30363d]">
                        <SelectItem
                          value="__unassigned__"
                          className="text-[#7d8590] focus:bg-[#21262d] focus:text-[#e6edf3]"
                        >
                          Unassigned
                        </SelectItem>
                        {availableAssignees.map((name) => (
                          <SelectItem
                            key={name}
                            value={name}
                            className="text-[#e6edf3] focus:bg-[#21262d] focus:text-[#e6edf3]"
                          >
                            {name}
                          </SelectItem>
                        ))}
                        <SelectItem
                          value="__custom__"
                          className="text-[#58a6ff] focus:bg-[#21262d] focus:text-[#58a6ff] border-t border-[#30363d] mt-1"
                        >
                          <div className="flex items-center gap-2">
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Add New...</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Input
                      placeholder="Enter assignee name..."
                      value={editTaskAssignee}
                      onChange={(e) => setEditTaskAssignee(e.target.value)}
                      className="bg-[#010409] border-[#30363d] text-[#e6edf3]"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setShowEditCustomAssignee(false);
                        setEditTaskAssignee('');
                      }}
                      className="text-xs text-[#58a6ff] hover:underline"
                    >
                      ← Select from list
                    </button>
                  </div>
                )}
              </div>

              {/* Date and Time Section */}
              <div className="border-t border-[#30363d] pt-4 space-y-4">
                <h3 className="text-sm font-medium text-[#e6edf3] flex items-center gap-2">
                  <span className="text-[#58a6ff]">📅</span>
                  Schedule & Deadline
                </h3>
                
                {/* Start Date and Time - Side by Side */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#7d8590]">Start Date</label>
                    <Input
                      type="date"
                      value={editTaskStartDate}
                      onChange={(e) => setEditTaskStartDate(e.target.value)}
                      className="bg-[#010409] border-[#30363d] text-[#e6edf3] [color-scheme:dark]"
                      placeholder="dd-mm-yyyy"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#7d8590]">Start Time</label>
                    <Input
                      type="time"
                      value={editTaskStartTime}
                      onChange={(e) => setEditTaskStartTime(e.target.value)}
                      className="bg-[#010409] border-[#30363d] text-[#e6edf3] [color-scheme:dark]"
                      placeholder="--:--"
                    />
                  </div>
                </div>

                {/* End Date and Time - Side by Side */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#7d8590]">End Date (Deadline)</label>
                    <Input
                      type="date"
                      value={editTaskEndDate}
                      onChange={(e) => setEditTaskEndDate(e.target.value)}
                      className="bg-[#010409] border-[#30363d] text-[#e6edf3] [color-scheme:dark]"
                      placeholder="dd-mm-yyyy"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#7d8590]">End Time</label>
                    <Input
                      type="time"
                      value={editTaskEndTime}
                      onChange={(e) => setEditTaskEndTime(e.target.value)}
                      className="bg-[#010409] border-[#30363d] text-[#e6edf3] [color-scheme:dark]"
                      placeholder="--:--"
                    />
                  </div>
                </div>

                {/* Calendar Status/Action */}
                {editTaskStartDate && editTaskStartTime && editTaskEndDate && editTaskEndTime && (
                  <div className="space-y-2">
                    {calendarEnabled ? (
                      <div className="flex items-center justify-between gap-3 px-3 py-2 bg-[#238636]/10 border border-[#238636]/30 rounded-md">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#3fb950]">✓ Ready to sync with Google Calendar</span>
                        </div>
                        <button
                          onClick={() => {
                            // This will be triggered when save is clicked
                          }}
                          className="text-xs px-3 py-1 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md transition-colors flex items-center gap-1.5"
                        >
                          <span>📅</span>
                          <span>Will sync on save</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 px-3 py-2 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-md">
                        <span className="text-xs text-[#58a6ff]">ℹ️ Calendar integration available but not configured</span>
                        <a 
                          href="http://localhost:3001/google-calendar-setup" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-[#58a6ff] hover:underline font-medium"
                        >
                          → Click here to connect Google Calendar
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={saveEditedTask}
                  disabled={!editTaskTitle.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold"
                >
                  {editTaskStartDate && editTaskStartTime && editTaskEndDate && editTaskEndTime && calendarEnabled
                    ? '💾 Save & Add to Calendar'
                    : '💾 Save Changes'}
                </Button>
                <Button
                  onClick={() => setEditingTask(null)}
                  variant="outline"
                  className="bg-[#21262d] border-[#30363d] text-[#e6edf3] hover:bg-[#30363d] hover:border-[#58a6ff]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};
