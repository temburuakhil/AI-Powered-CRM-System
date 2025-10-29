# Kanban Board - AI Task Generation Feature

## Overview
The Kanban board now includes an AI-powered task generation feature that uses Google's Gemini API to automatically create project tasks based on your knowledge base files and project data.

## ✨ Features

### 1. **Smart Context-Aware Generation**
- Analyzes uploaded knowledge base files (PDF, TXT, DOC)
- Reviews Google Sheets project data
- Considers available team members for assignment
- Generates 5-10 actionable tasks per request

### 2. **Intelligent Task Creation**
Each generated task includes:
- **Title**: Clear, concise task name (max 60 characters)
- **Description**: Detailed 1-2 sentence explanation
- **Assignee**: Automatically matched to team members from your data
- **Column**: Smart placement (TODO, IN PROGRESS, or DONE)

### 3. **Beautiful UI**
- Purple/pink gradient design matching modern aesthetics
- Real-time generation with loading states
- Context preview showing available resources
- Seamless integration with existing Kanban board

## 🚀 How to Use

### Step 1: Open Kanban Board
1. Navigate to any project in ProjectDetail page
2. Click the **Trello icon** button to open Kanban board

### Step 2: Generate Tasks with AI
1. Click the **"Generate Tasks with AI"** button (with sparkle icon)
2. Review available context:
   - Number of Google Sheets records
   - Knowledge base files uploaded
   - Team members available
3. Enter your task generation prompt

### Step 3: Enter Your Prompt
**Example Prompts:**
```
Create tasks for onboarding new team members
```

```
Generate a sprint plan for implementing the user authentication system
```

```
Create tasks for documentation review and updates based on the uploaded files
```

```
Plan tasks for quarterly performance reviews
```

### Step 4: AI Generates Tasks
- AI analyzes your knowledge base content
- Reviews project data structure
- Generates contextually relevant tasks
- Automatically adds them to appropriate columns

## 📋 Use Cases

### 1. **Project Onboarding**
```
Prompt: "Create comprehensive onboarding tasks for new developers"

Generated Tasks:
- Set up development environment (TODO)
- Review codebase documentation (TODO)
- Complete security training (IN PROGRESS)
- Schedule team introduction meetings (TODO)
```

### 2. **Sprint Planning**
```
Prompt: "Generate sprint tasks for implementing payment gateway"

Generated Tasks:
- Research payment providers (TODO)
- Design payment flow architecture (TODO)
- Implement Stripe integration (TODO)
- Create payment confirmation UI (TODO)
- Write unit tests for payment module (TODO)
```

### 3. **Documentation Projects**
```
Prompt: "Create tasks for updating project documentation"

Generated Tasks:
- Audit existing documentation (TODO)
- Update API reference guide (TODO)
- Create user tutorials (TODO)
- Review and fix broken links (IN PROGRESS)
```

### 4. **Knowledge Base Review**
```
Prompt: "Generate tasks to review and organize uploaded documents"

Generated Tasks:
- Categorize PDF files by topic (TODO)
- Extract key insights from user manual (TODO)
- Create summary documents (TODO)
- Archive outdated content (TODO)
```

## 🔧 Technical Details

### API Integration
- **Provider**: Google Gemini API (gemini-1.5-flash model)
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
- **API Key**: Configured in component (stored securely)

### Context Building
The AI receives rich context including:

1. **Knowledge Base Files**:
   - File names and types
   - Text content from .txt files (first 1000 chars)
   - File metadata

2. **Project Data**:
   - Total record count
   - Column names
   - Sample data (first 3 records)

3. **Team Information**:
   - Available assignees from Google Sheets
   - Name extraction from data columns

### Response Processing
- JSON parsing with error handling
- Markdown code block extraction
- Task validation and sanitization
- Automatic column assignment

## 🎨 UI Components

### "Generate Tasks with AI" Button
- **Location**: Kanban board header
- **Style**: Purple to pink gradient
- **Icon**: Sparkle (✨)
- **Action**: Opens AI prompt dialog

### AI Generation Dialog
**Components**:
- Header with AI icon
- Context preview panel (green checkmarks)
- Large textarea for prompt input
- Generate button with loading state
- Cancel button

**States**:
- Default: Ready for input
- Loading: Spinning loader, disabled inputs
- Success: Toast notification + auto-close
- Error: Error toast with details

## 📊 Example Workflow

```
User Flow:
┌─────────────────────────────────┐
│ 1. Open Kanban Board            │
└───────────┬─────────────────────┘
            ↓
┌─────────────────────────────────┐
│ 2. Click "Generate Tasks with AI"│
└───────────┬─────────────────────┘
            ↓
┌─────────────────────────────────┐
│ 3. View Available Context       │
│    ✓ 150 records                │
│    ✓ 3 knowledge base files     │
│    ✓ 12 team members            │
└───────────┬─────────────────────┘
            ↓
┌─────────────────────────────────┐
│ 4. Enter Generation Prompt      │
│    "Create tasks for Q1 planning"│
└───────────┬─────────────────────┘
            ↓
┌─────────────────────────────────┐
│ 5. AI Analyzes Context          │
│    • Reads knowledge base        │
│    • Reviews project data        │
│    • Identifies team members     │
└───────────┬─────────────────────┘
            ↓
┌─────────────────────────────────┐
│ 6. Tasks Generated & Added      │
│    ✓ 8 tasks created            │
│    ✓ Assigned to team members   │
│    ✓ Organized in columns       │
└─────────────────────────────────┘
```

## 🔒 Security & Privacy

### Data Handling
- Knowledge base files read from **localStorage** only
- API calls made directly to Google Gemini (HTTPS)
- No data stored on external servers
- Project data sanitized before sending to AI

### API Key Management
- Hardcoded in component (for demo)
- **Production**: Move to environment variables
- Consider backend proxy for key security

## ⚡ Performance

### Optimization
- Async/await for non-blocking operations
- Text content limited to 1000 characters per file
- Sample data limited to first 3 records
- JSON parsing with error recovery

### Loading States
- Button disabled during generation
- Spinner animation
- Status messages
- Timeout handling

## 🎯 Best Practices

### Writing Effective Prompts

**✅ Good Prompts:**
```
"Create tasks for implementing user authentication with OAuth"
"Generate documentation tasks for our API endpoints"
"Plan sprint tasks for mobile app feature development"
"Create onboarding checklist for new designers"
```

**❌ Avoid:**
```
"Make tasks" (too vague)
"Do everything" (too broad)
"Create 100 tasks" (unrealistic)
```

### Tips for Better Results
1. **Be Specific**: Mention the feature or goal
2. **Provide Context**: Reference uploaded documents if relevant
3. **Set Scope**: Indicate timeframe (sprint, week, quarter)
4. **Mention Team**: If specific roles needed, include them

## 🐛 Troubleshooting

### Issue: No Tasks Generated
**Check:**
- Prompt is not empty
- Internet connection active
- Gemini API key valid
- Browser console for errors

### Issue: Tasks Not Matching Context
**Solution:**
- Upload more detailed knowledge base files
- Use more specific prompts
- Reference specific documents in prompt

### Issue: Wrong Assignees
**Solution:**
- Verify Google Sheets has "Name" column
- Check name formatting (capitalization)
- Manually edit assignees after generation

### Issue: API Error
**Check:**
- Gemini API quota not exceeded
- API key has proper permissions
- Network firewall not blocking requests

## 🔮 Future Enhancements

### Planned Features
- [ ] **Custom AI Models**: Support for different models (GPT-4, Claude)
- [ ] **Task Templates**: Save common generation patterns
- [ ] **Bulk Operations**: Generate for multiple projects at once
- [ ] **Task Dependencies**: AI suggests task relationships
- [ ] **Time Estimates**: AI predicts task duration
- [ ] **Priority Scoring**: AI assigns importance levels
- [ ] **Smart Editing**: Refine generated tasks with AI
- [ ] **Context Memory**: Remember previous generations
- [ ] **PDF Text Extraction**: Read full PDF content
- [ ] **Multi-Language**: Generate tasks in different languages

## 📝 Code Structure

### Key Files
- **KanbanBoard.tsx**: Main component with AI integration
- **Backend**: No backend changes required (direct API calls)

### Main Functions
```typescript
generateTasksWithAI()  // Core AI generation logic
- Loads knowledge base from localStorage
- Extracts text content from files
- Builds context prompt
- Calls Gemini API
- Parses JSON response
- Adds tasks to columns
- Shows success/error toasts
```

### State Management
```typescript
const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
const [showAIPrompt, setShowAIPrompt] = useState(false);
const [aiPrompt, setAiPrompt] = useState("");
```

## 📊 Sample API Response

### Gemini API Request
```json
{
  "contents": [{
    "parts": [{
      "text": "You are a project management assistant..."
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 2048
  }
}
```

### Expected Response Format
```json
[
  {
    "title": "Set up development environment",
    "description": "Install Node.js, VS Code, and required dependencies",
    "assignee": "John Doe",
    "column": "todo"
  },
  {
    "title": "Review project requirements",
    "description": "Read through project documentation and create questions list",
    "assignee": "Jane Smith",
    "column": "inprogress"
  }
]
```

## 🎓 Learning Resources

### Understanding the AI
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [JSON Schema Design](https://json-schema.org/)

### Related Features
- See: `KNOWLEDGE_BASE_IMPLEMENTATION.md` - Knowledge base storage
- See: `VOICE_AGENT_WORKFLOW.md` - Similar Gemini integration example

---

## 🚀 Quick Start Example

1. **Upload Knowledge Base**:
   - Go to Create Project
   - Upload: `project-requirements.pdf`, `team-roster.txt`

2. **Open Kanban Board**:
   - Navigate to ProjectDetail
   - Click Trello icon

3. **Generate Tasks**:
   - Click "Generate Tasks with AI"
   - Enter: "Create sprint 1 tasks based on requirements document"
   - Click "Generate Tasks"
   - Wait 3-5 seconds
   - See 8-10 tasks automatically created! ✨

---

**Implementation Date**: October 29, 2025  
**Version**: 1.0.0  
**Status**: ✅ Ready to Use  
**AI Model**: Google Gemini 1.5 Flash
