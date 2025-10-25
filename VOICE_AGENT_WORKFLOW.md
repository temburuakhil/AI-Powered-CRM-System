# Voice Agent Creation Workflow

## Complete Flow (After SIP Trunk Configuration)

### 1. Generate Agent Prompt with Gemini AI
**Endpoint:** Direct API call to Gemini
```
GET https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

**Request:**
- Uses hardcoded Gemini API Key: `AIzaSyD7vSRpYuUElu_2FcvQYhVPRnmXAAbPG_A`
- Sends project context, knowledge base files
- Generates professional voice agent system prompt

**Response:**
- AI-generated prompt stored in `agentPrompt` state
- User can review and edit before creating agent

---

### 2. Create Retell LLM (Response Engine)
**Endpoint:** `POST http://localhost:3001/api/retell/create-llm`

**Backend makes call to:**
```
POST https://api.retellai.com/create-retell-llm
Authorization: Bearer key_7ae2ac651390bd59ee2c6cea4c40
```

**Request Body:**
```json
{
  "start_speaker": "agent",
  "general_prompt": "<AI-generated prompt from step 1>",
  "begin_message": "Hello! I'm calling from {Project Name}...",
  "general_tools": [],
  "states": [],
  "starting_state": null
}
```

**Response:**
```json
{
  "llm_id": "llm_xxxxxxxxxxxxx",
  "last_modification_timestamp": 1234567890,
  "version": 0
}
```

**Key Fields:**
- `start_speaker`: **Must be "agent"** (agent speaks first)
- `general_prompt`: The system prompt that guides agent behavior
- `begin_message`: First thing agent says when call connects

---

### 3. Create Retell Agent
**Endpoint:** `POST http://localhost:3001/api/retell/create-agent`

**Backend makes call to:**
```
POST https://api.retellai.com/create-agent
Authorization: Bearer key_7ae2ac651390bd59ee2c6cea4c40
```

**Request Body:**
```json
{
  "agent_name": "{Project Name} - Voice Agent",
  "voice_id": "11labs-Adrian",
  "language": "en-US",
  "response_engine": {
    "type": "retell-llm",
    "llm_id": "llm_xxxxxxxxxxxxx"
  },
  "enable_backchannel": true,
  "ambient_sound": "coffee-shop",
  "ambient_sound_volume": 0.1,
  "responsiveness": 1,
  "interruption_sensitivity": 1,
  "normalize_for_speech": true,
  "reminder_trigger_ms": 10000,
  "reminder_max_count": 2,
  "voice_temperature": 1,
  "voice_speed": 1,
  "end_call_after_silence_ms": 600000,
  "max_call_duration_ms": 3600000
}
```

**Response:**
```json
{
  "agent_id": "agent_xxxxxxxxxxxxx",
  "last_modification_timestamp": 1234567890,
  "version": 0,
  "agent_name": "{Project Name} - Voice Agent",
  "voice_id": "11labs-Adrian",
  "language": "en-US"
}
```

**Key Fields:**
- `response_engine.llm_id`: **Must be the LLM ID from step 2**
- `voice_id`: Voice model (11labs-Adrian = professional male voice)
- `language`: Speech recognition language
- `enable_backchannel`: Agent says "yeah", "uh-huh" during listening
- `ambient_sound`: Background noise for realism

---

### 4. Make Phone Calls
**Endpoint:** `POST http://localhost:3001/api/retell/create-call`

**Backend makes call to:**
```
POST https://api.retellai.com/create-phone-call
Authorization: Bearer key_7ae2ac651390bd59ee2c6cea4c40
```

**Request Body:**
```json
{
  "from_number": "+14066686379",
  "to_number": "+1234567890",
  "override_agent_id": "agent_xxxxxxxxxxxxx",
  "metadata": {
    "project_name": "OCAC Training Manager",
    "campaign_type": "voice_outbound",
    "knowledge_base_files": "doc1.pdf, doc2.txt"
  }
}
```

**Response:**
```json
{
  "call_id": "call_xxxxxxxxxxxxx",
  "call_status": "registered",
  "agent_id": "agent_xxxxxxxxxxxxx",
  "from_number": "+14066686379",
  "to_number": "+1234567890"
}
```

---

## Error Fixes Applied

### ❌ Previous Issue: Gemini API Error
**Problem:** Using deprecated model name `gemini-pro`

**Fix:**
```typescript
// Before
`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`

// After
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
```

### ✅ Enhanced Error Handling
Added detailed error logging:
- Logs Gemini API response for debugging
- Shows first 200 chars of error messages
- Validates JSON responses before parsing

---

## Testing the Flow

### Step-by-Step Test:

1. **Open Voice Campaign Dialog**
   - Click "Voice Campaign" button in DataTable

2. **Select Registered Phone** (if available)
   - Click on phone like "+14066686379"
   - Should show green success banner
   - Skip to step 4

3. **OR Configure New Phone**
   - Enter phone number (E.164 format: +1234567890)
   - Enter Termination URI
   - Enter SIP credentials
   - Click "Connect SIP Trunk"

4. **Generate Agent Prompt**
   - Click "Generate Agent Prompt with AI"
   - Wait for Gemini to generate prompt
   - Review the generated prompt (editable)

5. **Create Voice Agent**
   - Click "Create Voice Agent"
   - System creates LLM (step 2)
   - System creates Agent (step 3)
   - Agent ID displayed

6. **Start Campaign**
   - Click "Start Voice Campaign"
   - Calls made to all contacts with phone numbers

---

## Troubleshooting

### Gemini API Fails
- **Check:** API key is valid
- **Check:** Model name is `gemini-1.5-flash` (not `gemini-pro`)
- **Check:** Browser console for detailed error

### LLM Creation Fails
- **Check:** Backend running on port 3001
- **Check:** Retell API key is valid
- **Check:** `start_speaker` is set to "agent"

### Agent Creation Fails
- **Check:** LLM was created successfully
- **Check:** LLM ID is being passed correctly
- **Check:** Voice ID "11labs-Adrian" is available

### Call Creation Fails
- **Check:** Phone number is in E.164 format (+1234567890)
- **Check:** Agent ID exists
- **Check:** From number is registered in Retell

---

## Technical Architecture

```
Frontend (React)
    ↓
    ├─→ Gemini API (Direct) → Generate Prompt
    │
    └─→ Backend (Express on :3001)
            ↓
            └─→ Retell AI (api.retellai.com)
                    ├─→ /create-retell-llm → LLM ID
                    ├─→ /create-agent → Agent ID
                    └─→ /create-phone-call → Call ID
```

## Pre-configured Keys
- **Retell API:** `key_7ae2ac651390bd59ee2c6cea4c40`
- **Gemini API:** `AIzaSyD7vSRpYuUElu_2FcvQYhVPRnmXAAbPG_A`

---

## Next Steps After Implementation

1. Upload Knowledge Base documents
2. Import contact CSV with phone numbers
3. Configure SIP trunk or select registered phone
4. Generate AI prompt based on project context
5. Create voice agent with LLM
6. Launch campaign to all contacts
