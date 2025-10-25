# SIP Trunk Voice Integration Guide

## 🎯 Overview

This system integrates Retell AI voice calling with **your own SIP trunk phone number** instead of purchasing a Retell number. The Gemini API key and Retell API key are **pre-configured** for seamless setup.

## 🔑 Pre-Configured Keys

### ✅ Already Set Up
- **Gemini API Key**: `AIzaSyD7vSRpYuUElu_2FcvQYhVPRnmXAAbPG_A`
- **Retell API Key**: `key_7ae2ac651390bd59ee2c6cea4c40`

You don't need to enter these keys - they're hardcoded in the system!

## 📞 SIP Trunk Setup

### What You Need
1. **Your Phone Number** (E.164 format): `+14157774444`
2. **Your SIP Termination URI**: `sip:username@yourdomain.com`
3. **Optional**: SIP credentials (username/password)

### SIP Trunk Configuration Dialog

When you click "Voice Campaign", you'll see a form like the one in your screenshot:

```
Connect to your number via SIP trunking

Phone Number: +14157774444
Termination URI: sip:username@yourdomain.com (NOT Retell SIP server uri)
SIP Trunk User Name (Optional): username
SIP Trunk Password (Optional): ********
Nickname (Optional): My Business Phone
```

## 🚀 Quick Start (3 Steps)

### Step 1: Connect SIP Trunk
1. Open your project in the dashboard
2. Click "Voice Campaign" button
3. Enter your phone details:
   - **Phone Number**: Your phone in E.164 format (e.g., +14157774444)
   - **Termination URI**: Your SIP endpoint (NOT Retell's server)
   - **SIP Username**: Optional authentication
   - **SIP Password**: Optional authentication
   - **Nickname**: Optional label
4. Click "Connect SIP Trunk"

### Step 2: Generate AI Agent Prompt
1. Click "Generate Agent Prompt with AI"
2. System automatically:
   - Reads your uploaded knowledge base files (PDFs, DOCs)
   - Sends context to Gemini AI
   - Generates intelligent conversation prompt
3. Review the generated prompt

### Step 3: Deploy Agent
1. Click "Create & Deploy Agent"
2. System automatically:
   - Creates Retell AI agent with generated prompt
   - Links agent to your SIP trunk phone
   - Returns ready-to-use Agent ID
3. Click "Start Voice Campaign"

## 🎨 UI Features

### Color-Coded Workflow
- **🟠 Step 1 (Orange)**: SIP Trunk Configuration
- **🔵 Step 2 (Blue)**: AI Prompt Generation
- **🟣 Step 3 (Purple)**: Agent Deployment
- **🟢 Step 4 (Green)**: Campaign Launch

### Visual Indicators
- ✓ **Pre-configured badges** for Gemini/Retell keys
- **Progress spinners** during API calls
- **Success checkmarks** when steps complete
- **Error alerts** with helpful messages

## 🔧 Technical Architecture

### Backend Endpoints

#### 1. Configure SIP Trunk
```javascript
POST /api/retell/configure-sip
Content-Type: application/json

{
  "apiKey": "key_7ae2ac651390bd59ee2c6cea4c40",
  "phoneNumber": "+14157774444",
  "terminationUri": "sip:username@domain.com",
  "sipUsername": "optional_user",
  "sipPassword": "optional_pass",
  "nickname": "My Phone"
}
```

Response:
```json
{
  "success": true,
  "phone": {
    "phone_number": "+14157774444",
    "phone_number_id": "phone_123abc",
    "termination_uri": "sip:username@domain.com",
    "nickname": "My Phone"
  }
}
```

#### 2. Create Agent (uses existing endpoint)
```javascript
POST /api/retell/create-agent

{
  "apiKey": "key_7ae2ac651390bd59ee2c6cea4c40",
  "agentName": "OCAC Training Assistant",
  "systemPrompt": "AI-generated prompt...",
  "voiceId": "11labs-Adrian",
  "language": "en-US"
}
```

#### 3. Create Call (uses existing endpoint)
```javascript
POST /api/retell/create-call

{
  "apiKey": "key_7ae2ac651390bd59ee2c6cea4c40",
  "fromNumber": "+14157774444",  // Your SIP trunk number
  "toNumber": "+19876543210",     // Contact to call
  "agentId": "agent_123abc"
}
```

## 🔄 Component State Management

```typescript
// Pre-configured keys
const [retellApiKey] = useState("key_7ae2ac651390bd59ee2c6cea4c40");
const [geminiApiKey] = useState("AIzaSyD7vSRpYuUElu_2FcvQYhVPRnmXAAbPG_A");

// SIP Trunk state
const [phoneNumber, setPhoneNumber] = useState("");
const [terminationUri, setTerminationUri] = useState("");
const [sipUsername, setSipUsername] = useState("");
const [sipPassword, setSipPassword] = useState("");
const [nickname, setNickname] = useState("");
const [isSipConfigured, setIsSipConfigured] = useState(false);

// Agent state
const [agentId, setAgentId] = useState("");
const [agentPrompt, setAgentPrompt] = useState("");
const [isCreatingAgent, setIsCreatingAgent] = useState(false);
```

## 📊 Workflow Diagram

```
┌──────────────────────────────────────────────────────────┐
│  User Opens Project → Clicks "Voice Campaign"           │
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│  Step 1: Connect SIP Trunk                               │
│  • Enter phone number                                    │
│  • Enter SIP termination URI                             │
│  • Optional: SIP credentials                             │
│  • System calls /api/retell/configure-sip                │
│  • ✓ Phone connected to Retell                          │
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│  Step 2: Generate AI Prompt                              │
│  • System reads knowledge base files                     │
│  • Calls Gemini API with context                         │
│  • Generates intelligent conversation prompt             │
│  • ✓ Prompt ready                                        │
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│  Step 3: Deploy Agent                                    │
│  • System calls /api/retell/create-agent                 │
│  • Links agent to SIP trunk phone                        │
│  • ✓ Agent deployed (Agent ID returned)                 │
└─────────────────┬────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────┐
│  Step 4: Launch Campaign                                 │
│  • Upload CSV with contacts                              │
│  • System initiates calls to each contact                │
│  • Real-time progress tracking                           │
│  • ✓ Campaign running                                    │
└──────────────────────────────────────────────────────────┘
```

## 🎤 Voice Agent Configuration

### Default Settings
- **Voice**: 11labs-Adrian
- **Language**: en-US
- **Responsiveness**: 1 (balanced)
- **Ambient Sound**: Coffee shop background
- **Interruption Sensitivity**: 1 (natural)

### Customization Options
Edit `VoiceCampaign.tsx` to change:
```typescript
const requestBody = {
  voice_id: "11labs-Adrian",  // Change voice
  language: "en-US",           // Change language
  responsiveness: 1,           // 0-2 (slower to faster)
  ambient_sound: "coffee-shop",// Background noise
  voice_temperature: 1,        // Creativity level
  voice_speed: 1,              // Speaking speed
};
```

## 🌍 Supported Languages
- en-US (English - US)
- en-GB (English - UK)
- en-IN (English - India)
- en-AU (English - Australia)
- es-ES (Spanish - Spain)
- es-419 (Spanish - Latin America)
- fr-FR (French)
- de-DE (German)
- it-IT (Italian)
- pt-BR (Portuguese - Brazil)
- nl-NL (Dutch)
- pl-PL (Polish)
- ja-JP (Japanese)
- ko-KR (Korean)
- zh-CN (Chinese - Simplified)
- zh-TW (Chinese - Traditional)

## 🔐 Security Best Practices

### Current Setup (Development)
- Keys hardcoded in component (convenient for demo)
- **⚠️ WARNING**: Not suitable for production!

### Production Recommendations
1. Move keys to environment variables:
   ```bash
   # backend/.env
   GEMINI_API_KEY=AIzaSyD7vSRpYuUElu_2FcvQYhVPRnmXAAbPG_A
   RETELL_API_KEY=key_7ae2ac651390bd59ee2c6cea4c40
   ```

2. Fetch from backend:
   ```typescript
   // VoiceCampaign.tsx
   useEffect(() => {
     fetch('/api/config/keys')
       .then(res => res.json())
       .then(data => {
         setGeminiApiKey(data.geminiKey);
         setRetellApiKey(data.retellKey);
       });
   }, []);
   ```

3. Use key management service (AWS KMS, Azure Key Vault)

## 📈 Analytics & Monitoring

### Call Tracking
Each call stores metadata:
```json
{
  "project_name": "OCAC Training Manager",
  "campaign_type": "voice_outbound",
  "knowledge_base_files": "guide.pdf, faq.docx",
  "contact_name": "John Doe",
  "contact_email": "john@example.com"
}
```

### Progress Indicators
```typescript
{
  recipientPhone: "+19876543210",
  recipientName: "John Doe",
  status: "in_progress",  // queued | in_progress | completed | failed
  callId: "call_123abc",
  startedAt: "2025-10-21T10:30:00Z"
}
```

## 🐛 Troubleshooting

### Issue: "Failed to configure SIP trunk"
**Solution**: 
- Verify phone number format (+14157774444)
- Check termination URI is correct
- Ensure URI is NOT Retell's SIP server
- Test SIP credentials separately

### Issue: "Agent prompt generation failed"
**Solution**:
- Check knowledge base files uploaded
- Verify Gemini API key quota
- Review error message in toast

### Issue: "Call failed to initiate"
**Solution**:
- Confirm SIP trunk configured (✓)
- Verify agent created (✓)
- Check recipient number format
- Review backend logs

### Issue: "No audio during call"
**Solution**:
- Test SIP termination URI separately
- Verify SIP credentials
- Check firewall/NAT settings
- Review SIP trunk provider status

## 📞 SIP Provider Examples

### Twilio
```
Phone Number: +14157774444
Termination URI: sip:+14157774444@yourcompany.pstn.twilio.com
SIP Username: (leave empty)
SIP Password: (leave empty)
```

### Vonage
```
Phone Number: +14157774444
Termination URI: sip:14157774444@sip.nexmo.com
SIP Username: your_vonage_username
SIP Password: your_vonage_password
```

### Telnyx
```
Phone Number: +14157774444
Termination URI: sip:+14157774444@sip.telnyx.com
SIP Username: your_telnyx_username
SIP Password: your_telnyx_password
```

## 🎓 Knowledge Base Integration

### How It Works
1. System reads `knowledgeBaseFiles` prop
2. Extracts content from PDFs, DOCs, TXT
3. Sends to Gemini with prompt:
   ```
   Create a voice agent prompt for calling contacts about this project.
   
   Project: OCAC Training Manager
   Context: [knowledge base content...]
   
   Generate a natural, conversational prompt for the voice agent.
   ```
4. Gemini returns optimized prompt
5. Prompt used to create Retell agent

### Supported Files
- PDF documents
- Word documents (.doc, .docx)
- Text files (.txt)
- Markdown files (.md)

## 🚀 Performance Tips

### 1. Batch Calling
- Process contacts in chunks of 50
- Add 1-2 second delay between calls
- Monitor API rate limits

### 2. Error Handling
- Retry failed calls (max 3 attempts)
- Log errors for analysis
- Alert user of critical failures

### 3. Cost Optimization
- Use voice mail detection
- Set max call duration (5 min)
- Filter invalid numbers before calling

## 📚 Additional Resources

- [Retell AI Documentation](https://docs.retellai.com/)
- [SIP Trunking Guide](https://docs.retellai.com/get-started/create-phone-call#connect-to-your-number-via-sip-trunking)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Voice ID Options](https://docs.retellai.com/agent-configuration/voice-model)

## 🆘 Support

### Common Questions

**Q: Can I use multiple phone numbers?**
A: Yes! Configure each number separately and select when creating campaigns.

**Q: How much does this cost?**
A: Retell charges per minute of call time. Check their pricing page.

**Q: Can I use a local (non-US) number?**
A: Yes! Any number in E.164 format works with SIP trunking.

**Q: What if I don't have a SIP trunk?**
A: You can purchase a Retell number instead (see original VOICE_CAMPAIGN_QUICKSTART.md).

---

**Last Updated**: October 21, 2025  
**Version**: 2.0 (SIP Trunk Integration)
