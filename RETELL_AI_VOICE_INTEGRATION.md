# Retell AI Voice Integration Guide 📞

## Overview

This project now includes **Retell AI voice calling** integration, enabling you to make automated AI-powered phone calls to contacts in your Google Sheets data. This feature works alongside the existing email campaign functionality.

---

## ✨ Features Implemented

### 1. **Voice Campaign Component**
- 🎙️ **AI-Powered Voice Calls** using Retell AI
- 📞 **Bulk Calling** to multiple recipients
- 📊 **Real-time Progress Tracking** with success/failure counts
- ⏸️ **Pause/Resume** functionality during campaigns
- 📝 **Call Logs** with detailed status for each call
- 🔄 **Auto Status Update** (changes status to "Called" after successful call)
- 🎯 **Dynamic Variables** injection into AI agent prompts

### 2. **Backend API Endpoints**
- `/api/retell/create-call` - Create outbound phone calls
- `/api/retell/call/:callId` - Get call details
- `/api/retell/calls` - List all calls
- `/api/retell/webhook` - Handle Retell AI webhooks

### 3. **Smart Phone Number Detection**
- Automatically detects phone/mobile columns in your data
- Supports E.164 format phone numbers
- Auto-formats US numbers (adds +1 if missing)

---

## 🚀 Setup Instructions

### Step 1: Create Retell AI Account

1. **Sign up at Retell AI**
   - Visit [https://www.retellai.com](https://www.retellai.com)
   - Create an account
   - Navigate to [dashboard.retellai.com](https://dashboard.retellai.com)

2. **Get Your API Key**
   - Go to **Dashboard → API Keys**
   - Click "Create API Key"
   - Copy the key (format: `key_xxxxxxxxxxxxx`)
   - Keep it secure!

### Step 2: Purchase a Phone Number

1. **Buy a Number from Retell**
   - Go to **Dashboard → Phone Numbers**
   - Click "Purchase Number"
   - Select your country (US numbers supported for outbound)
   - Choose a number
   - Complete purchase

2. **Note Your Number**
   - Copy the purchased number in E.164 format
   - Example: `+14157774444`

### Step 3: Create an AI Agent

1. **Create Agent**
   - Go to **Dashboard → Agents**
   - Click "Create Agent"
   - Configure your agent:
     - **Name**: e.g., "Outbound Sales Agent"
     - **Voice**: Choose from available voices
     - **Language**: Select language
     - **System Prompt**: Write instructions for your AI agent

2. **Example System Prompt**:
```
You are a friendly outbound sales representative calling to follow up with customers who haven't completed their registration.

Your goals:
1. Greet the customer warmly
2. Remind them about their incomplete registration
3. Ask if they need help completing it
4. Answer any questions they have
5. Thank them and end the call professionally

Be conversational, empathetic, and helpful. Keep the call under 2 minutes.
```

3. **Save and Copy Agent ID**
   - Save your agent
   - Copy the Agent ID (format: `agent_xxxxxxxxxxxxx`)

### Step 4: Configure Backend

The backend is already set up! Just make sure it's running:

```bash
cd backend
npm install
npm start
```

Backend will run on `http://localhost:3001`

---

## 📋 Using Voice Campaigns

### 1. **Prepare Your Google Sheet**

Your sheet should have:
- **Phone/Mobile Column**: Phone numbers in any format
- **Status Column** (optional): To track call status
- **Name Column** (optional): For personalization

**Example Sheet Structure**:
```
| Name    | Phone         | Email              | Status         |
|---------|---------------|-------------------|----------------|
| John    | +14151234567  | john@example.com  | Not Completed  |
| Jane    | 415-555-0100  | jane@example.com  | Completed      |
| Bob     | 4155550101    | bob@example.com   | Not Completed  |
```

### 2. **Open Voice Campaign Dialog**

1. Navigate to your project detail page
2. Click the **"Voice Campaign"** button (purple/pink gradient)
3. The dialog will show how many recipients can be called

### 3. **Configure Retell AI**

Fill in the required fields:

#### **Retell API Key** *
```
key_xxxxxxxxxxxxx
```
Get from: [Dashboard → API Keys](https://dashboard.retellai.com/dashboard/api-keys)

#### **From Number** *
```
+14157774444
```
Your purchased Retell phone number (E.164 format)

#### **Agent ID** *
```
agent_xxxxxxxxxxxxx
```
Get from: [Dashboard → Agents](https://dashboard.retellai.com/dashboard/agents)

#### **Dynamic Variables** (Optional)
```json
{
  "customer_name": "John Doe",
  "product_name": "Premium Plan",
  "company_name": "OCAC"
}
```
These variables will be injected into your agent's prompt.

### 4. **Start the Campaign**

1. Review the configuration
2. Click **"Start Voice Campaign"**
3. Watch real-time progress:
   - ✅ Successful Calls counter
   - ❌ Failed Calls counter
   - 📊 Progress bar
   - 📝 Detailed call logs

### 5. **Manage Campaign**

- **Pause**: Click "Pause" button to temporarily stop
- **Resume**: Click "Resume" to continue
- **Stop**: Close dialog to cancel campaign

### 6. **After Campaign**

- View call logs for each number
- Status column updated to "Called" for successful calls
- Campaign summary shown in toast notification

---

## 🔧 Technical Details

### Phone Number Format

The system accepts multiple formats and converts to E.164:

| Input Format      | Converted To   |
|-------------------|----------------|
| `4155551234`      | `+14155551234` |
| `415-555-1234`    | `+14155551234` |
| `(415) 555-1234`  | `+14155551234` |
| `+14155551234`    | `+14155551234` |

### API Request Format

```javascript
POST http://localhost:3001/api/retell/create-call

{
  "apiKey": "key_xxxxxxxxxxxxx",
  "fromNumber": "+14157774444",
  "toNumber": "+14155551234",
  "agentId": "agent_xxxxxxxxxxxxx",
  "metadata": {
    "project_name": "Customer Follow-up",
    "campaign_type": "voice_outbound",
    "recipient_name": "John Doe"
  },
  "dynamicVariables": {
    "customer_name": "John Doe",
    "product": "Premium Plan"
  }
}
```

### API Response

```javascript
{
  "success": true,
  "message": "Call created successfully",
  "call_id": "Jabr9TXYYJHfvl6Syypi88rdAHYHmcq6",
  "call_status": "registered",
  "agent_id": "agent_xxxxxxxxxxxxx",
  "from_number": "+14157774444",
  "to_number": "+14155551234",
  "start_timestamp": 1703302407333
}
```

---

## 🎯 Dynamic Variables Usage

### What are Dynamic Variables?

Dynamic variables allow you to inject personalized data into your AI agent's prompt for each call.

### Example Configuration

**Agent Prompt**:
```
You are calling {{customer_name}} about their {{product_name}} subscription.
They signed up on {{signup_date}} but haven't completed setup.
```

**Dynamic Variables**:
```json
{
  "customer_name": "John Doe",
  "product_name": "Premium Plan",
  "signup_date": "October 15, 2025"
}
```

**Result**: The AI agent will use these values in the conversation naturally.

### Auto-Populated Variables

The system automatically includes:
- `recipient_name` - From Name column
- `recipient_email` - From Email column
- `project_name` - Your project name
- `campaign_type` - "voice_outbound"

---

## 📊 Webhook Integration (Optional)

### Setup Webhooks

1. **Configure Webhook URL**
   - Go to Retell Dashboard → Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/api/retell/webhook`
   - Select events: `call_started`, `call_ended`, `call_analyzed`

2. **Webhook Events**

#### `call_started`
Triggered when call begins
```json
{
  "event": "call_started",
  "call": {
    "call_id": "xxx",
    "call_status": "ongoing",
    "start_timestamp": 1703302407333
  }
}
```

#### `call_ended`
Triggered when call ends
```json
{
  "event": "call_ended",
  "call": {
    "call_id": "xxx",
    "call_status": "ended",
    "duration_ms": 45000,
    "disconnection_reason": "user_hangup",
    "end_timestamp": 1703302452333
  }
}
```

#### `call_analyzed`
Triggered after AI analysis completes
```json
{
  "event": "call_analyzed",
  "call": {
    "call_id": "xxx",
    "call_analysis": {
      "call_summary": "Customer was interested and wants to complete registration...",
      "user_sentiment": "Positive",
      "call_successful": true
    }
  }
}
```

---

## 💰 Pricing Considerations

### Retell AI Costs

- **Per Minute**: ~$0.05-0.15 per minute depending on plan
- **Phone Number**: ~$2-5/month
- **AI Model**: Varies by model (GPT-4, Claude, etc.)

### Estimate Campaign Cost

```
Example: 100 recipients × 2 min avg × $0.10/min = $20
```

**Tips to Reduce Costs**:
1. Filter recipients carefully
2. Keep calls under 2 minutes
3. Use off-peak hours if available
4. Test with small batches first

---

## 🔐 Security Best Practices

### 1. **Never Commit API Keys**
```bash
# Add to .gitignore
.env
.env.local
```

### 2. **Use Environment Variables**
```javascript
// backend/.env
RETELL_API_KEY=key_xxxxxxxxxxxxx
RETELL_FROM_NUMBER=+14157774444
RETELL_AGENT_ID=agent_xxxxxxxxxxxxx
```

### 3. **Implement Rate Limiting**
```javascript
// Current: 2 second delay between calls
// Adjust in VoiceCampaign.tsx line ~180
await new Promise(resolve => setTimeout(resolve, 2000));
```

### 4. **Validate Phone Numbers**
- Always validate before calling
- Respect Do Not Call lists
- Follow local regulations (TCPA, GDPR, etc.)

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **"Failed to create call"**

**Causes**:
- Invalid API key
- Number not purchased from Retell
- Invalid phone number format
- Insufficient balance

**Solutions**:
- Verify API key in dashboard
- Check phone number format (+1XXXXXXXXXX)
- Ensure number is purchased and active
- Check account balance

#### 2. **"CORS Error"**

**Cause**: Backend not running or wrong port

**Solution**:
```bash
cd backend
npm start
# Should run on port 3001
```

#### 3. **"Invalid From Number"**

**Cause**: Number not in E.164 format

**Solution**:
- Must start with `+`
- Example: `+14157774444`
- No spaces, dashes, or parentheses

#### 4. **Calls Not Connecting**

**Causes**:
- Invalid destination number
- Number blocked or invalid
- Agent not configured properly

**Solutions**:
- Test with your own number first
- Check number is active and can receive calls
- Verify agent settings in dashboard

---

## 📈 Advanced Features

### 1. **Call Analytics**

Access call details after completion:

```javascript
GET http://localhost:3001/api/retell/call/:callId
Headers: x-retell-api-key: key_xxxxxxxxxxxxx

Response:
{
  "success": true,
  "data": {
    "transcript": "Agent: Hi, how are you...",
    "duration_ms": 45000,
    "recording_url": "https://...",
    "call_analysis": {
      "call_summary": "...",
      "user_sentiment": "Positive",
      "call_successful": true
    }
  }
}
```

### 2. **Multi-Language Support**

Configure agent for different languages:
- Spanish: "es"
- French: "fr"
- German: "de"
- And more...

### 3. **Custom Call Routing**

Route calls based on data:
```javascript
if (recipient.priority === "high") {
  agentId = "agent_premium_xxx";
} else {
  agentId = "agent_standard_xxx";
}
```

### 4. **Follow-up Automation**

After call ends, automatically:
- Send follow-up email
- Schedule callback
- Update CRM status
- Trigger webhooks

---

## 📱 UI Components

### VoiceCampaign Component

**Location**: `src/components/VoiceCampaign.tsx`

**Props**:
```typescript
interface VoiceCampaignProps {
  data: Record<string, any>[];      // Sheet data
  phoneColumn: string;               // Column name for phone numbers
  statusColumn?: string;             // Column name for status
  onStatusUpdate?: (data) => void;  // Callback after status update
  projectName?: string;              // Project name for metadata
}
```

**Usage**:
```tsx
<VoiceCampaign
  data={sheetData}
  phoneColumn="Phone"
  statusColumn="Status"
  onStatusUpdate={handleUpdate}
  projectName="Customer Outreach"
/>
```

### Features:
- ✅ Gradient purple/pink design
- ✅ Real-time progress tracking
- ✅ Success/failure counters
- ✅ Detailed call logs
- ✅ Pause/Resume controls
- ✅ Auto-close on completion

---

## 🔄 Integration with Existing Features

### Works Alongside Email Campaigns

Both buttons appear side-by-side:
```
[📧 Email Campaign] [📞 Voice Campaign]
```

### Shared Status Column

Both features can use the same status column:
- Not Completed → Needs outreach
- Called/Emailed → Contacted
- Completed → No action needed

### Knowledge Base Integration

Voice agents can reference knowledge base files uploaded to the project for context-aware conversations.

---

## 📝 Compliance & Legal

### Important Considerations

1. **TCPA Compliance** (US)
   - Get prior express consent before calling
   - Maintain do-not-call lists
   - Call only during permitted hours (8am-9pm local time)

2. **GDPR Compliance** (EU)
   - Obtain explicit consent
   - Allow opt-outs
   - Maintain data processing records

3. **Recording Disclosure**
   - Inform recipients calls may be recorded
   - Follow two-party consent laws where applicable

4. **Best Practices**
   - Honor opt-out requests immediately
   - Keep accurate records
   - Train AI agents to identify and respect opt-outs

---

## 🎓 Example Use Cases

### 1. **Registration Follow-up**
Call students who started but didn't complete registration.

### 2. **Appointment Reminders**
Automated reminders for scheduled appointments.

### 3. **Survey Calls**
Conduct automated satisfaction surveys.

### 4. **Lead Qualification**
Initial screening of sales leads.

### 5. **Payment Reminders**
Friendly reminders for pending payments.

---

## 🛠️ Development & Testing

### Test Mode

Before running production campaigns:

1. **Test with Your Number**
   ```json
   {
     "toNumber": "+1YOURNUMBER"
   }
   ```

2. **Test Agent Behavior**
   - Call your test number
   - Verify agent responses
   - Check conversation flow

3. **Monitor Dashboard**
   - Watch calls in real-time
   - Review transcripts
   - Analyze sentiment

### Production Checklist

- [ ] API keys secured
- [ ] Phone number verified
- [ ] Agent tested and working
- [ ] Recipients list validated
- [ ] Consent obtained
- [ ] Rate limiting configured
- [ ] Webhooks set up
- [ ] Error handling in place
- [ ] Monitoring configured

---

## 📚 Additional Resources

### Retell AI Documentation
- [API Reference](https://docs.retellai.com/api-references)
- [Agent Configuration](https://docs.retellai.com/agent-setup)
- [Voice Customization](https://docs.retellai.com/voice-options)
- [Webhooks Guide](https://docs.retellai.com/webhooks)

### Support Channels
- Retell AI Discord: [discord.gg/retellai](https://discord.gg/retellai)
- Email: support@retellai.com
- Documentation: docs.retellai.com

---

## 🚀 Future Enhancements

Planned features:
- [ ] Schedule calls for later
- [ ] Call recording playback in UI
- [ ] Transcript viewer
- [ ] Sentiment analysis dashboard
- [ ] A/B testing for agents
- [ ] SMS follow-up after calls
- [ ] Call quality metrics
- [ ] Advanced analytics
- [ ] Multi-agent routing
- [ ] IVR menu support

---

## 📊 Monitoring & Analytics

### Call Metrics to Track

1. **Volume Metrics**
   - Total calls made
   - Success rate
   - Failure rate
   - Average duration

2. **Quality Metrics**
   - User sentiment (Positive/Neutral/Negative)
   - Call success rate
   - Disconnection reasons
   - Callback requests

3. **Performance Metrics**
   - E2E latency
   - TTS latency
   - LLM response time

### View in Dashboard

Retell Dashboard provides:
- Real-time call monitoring
- Historical analytics
- Cost tracking
- Quality scores

---

## ✅ Summary

You now have a complete **AI-powered voice calling system** integrated into your project!

**Key Benefits**:
- 🤖 Automated outbound calling
- 📊 Real-time progress tracking
- 🎯 Personalized conversations
- 📞 Scalable to thousands of calls
- 📈 Detailed analytics and insights

**Next Steps**:
1. Create Retell AI account
2. Purchase phone number
3. Configure AI agent
4. Test with small batch
5. Scale to production

---

**Version**: 1.0.0  
**Last Updated**: October 21, 2025  
**Status**: ✅ Production Ready

---

**Support**: For issues or questions, refer to the troubleshooting section or contact the development team.
