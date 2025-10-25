# 🚀 SIP Voice Campaign - Quick Setup

## ✅ Pre-Configured (No Action Needed)
- **Gemini API Key**: AIzaSyD7vSRpYuUElu_2FcvQYhVPRnmXAAbPG_A ✓
- **Retell API Key**: key_7ae2ac651390bd59ee2c6cea4c40 ✓

## 📋 3-Step Setup

### Step 1: Connect Your SIP Trunk Phone 📞
```
Phone Number:       +14157774444
Termination URI:    sip:username@yourdomain.com
SIP Username:       (optional)
SIP Password:       (optional)
Nickname:           My Business Phone

[Connect SIP Trunk]
```

### Step 2: Generate AI Agent Prompt 🤖
```
System automatically:
✓ Reads your knowledge base files
✓ Calls Gemini API
✓ Generates intelligent prompt

[Generate Agent Prompt with AI]
```

### Step 3: Deploy Agent 🚀
```
System automatically:
✓ Creates Retell agent
✓ Links to your phone
✓ Returns Agent ID

[Create & Deploy Agent]
```

### Step 4: Launch Campaign 📢
```
✓ Upload contacts CSV
✓ Start calling

[Start Voice Campaign]
```

## 🎯 What You Need

### Required
- Your phone number (E.164 format: +14157774444)
- SIP termination URI (your SIP endpoint)
- Contacts CSV file

### Optional
- SIP authentication credentials
- Phone nickname

## 📊 UI Dialog Reference

Based on your screenshot, here's what you'll see:

```
┌─────────────────────────────────────────────────┐
│  Voice Campaign for [Project Name]              │
├─────────────────────────────────────────────────┤
│                                                  │
│  ℹ️ AI-Powered Agent Creation                   │
│  This system uses Gemini AI (pre-configured)    │
│  to automatically generate voice agent prompts  │
│                                                  │
│  ✓ Pre-configured: Gemini API Key and Retell   │
│    API Key are already set up. Just connect     │
│    your SIP trunk phone number to start!        │
│                                                  │
├─────────────────────────────────────────────────┤
│  🟠 Step 1: Connect Your Phone via SIP Trunk   │
│                                                  │
│  Phone Number *                                 │
│  [+14157774444                              ]   │
│  Your phone number in E.164 format              │
│                                                  │
│  Termination URI *                              │
│  [sip:username@yourdomain.com               ]   │
│  NOT Retell SIP server URI - your endpoint      │
│                                                  │
│  SIP Username (Optional)    SIP Password        │
│  [username            ]     [••••••••      ]    │
│                                                  │
│  Nickname (Optional)                            │
│  [My Business Phone                         ]   │
│                                                  │
│  [     Connect SIP Trunk     ]                  │
│                                                  │
├─────────────────────────────────────────────────┤
│  🔵 Step 2: Create AI Voice Agent              │
│                                                  │
│  ✓ Gemini API Key: Pre-configured               │
│                                                  │
│  [ Generate Agent Prompt with AI ]              │
│                                                  │
│  [Generated Prompt Preview Box]                 │
│                                                  │
├─────────────────────────────────────────────────┤
│  🟣 Step 3: Deploy Agent to Retell             │
│                                                  │
│  ✓ Retell API Key: Pre-configured               │
│                                                  │
│  [  Create & Deploy Agent  ]                    │
│                                                  │
│  ✓ Agent ID: agent_abc123                       │
│  ✓ Phone: +14157774444                          │
│                                                  │
├─────────────────────────────────────────────────┤
│  🟢 Step 4: Launch Campaign                    │
│                                                  │
│  Upload Contacts CSV                            │
│  [📎 Choose File] contacts.csv                  │
│                                                  │
│  [  Start Voice Campaign  ]                     │
│                                                  │
└─────────────────────────────────────────────────┘
```

## 🔧 SIP Provider Quick Setup

### Twilio
```
Phone:     +14157774444
Term URI:  sip:+14157774444@yourcompany.pstn.twilio.com
Username:  (leave empty)
Password:  (leave empty)
```

### Vonage
```
Phone:     +14157774444
Term URI:  sip:14157774444@sip.nexmo.com
Username:  your_vonage_username
Password:  your_vonage_password
```

### Telnyx
```
Phone:     +14157774444
Term URI:  sip:+14157774444@sip.telnyx.com
Username:  your_telnyx_username
Password:  your_telnyx_password
```

## ⚡ Quick Commands

### Start Backend
```powershell
cd backend
npm start
```

### Start Frontend
```powershell
npm run dev
```

## 🎯 Success Indicators

### SIP Trunk Connected
```
✓ SIP Trunk Connected
  (button turns green with checkmark)
```

### Prompt Generated
```
✓ Prompt Generated
  (preview box shows generated text)
```

### Agent Deployed
```
✓ Agent Created & Ready
  Agent ID: agent_abc123
  Phone: +14157774444
```

### Campaign Running
```
Progress: 5/100 calls
Status: In Progress
```

## 🐛 Quick Troubleshooting

| Error | Solution |
|-------|----------|
| "Failed to configure SIP" | Check phone format (+14157774444) |
| "Agent creation failed" | Verify SIP trunk connected first |
| "Call failed" | Confirm agent deployed successfully |
| "No audio" | Test SIP termination URI separately |

## 📞 Contact Format in CSV

```csv
name,phone,email
John Doe,+19876543210,john@example.com
Jane Smith,+18765432109,jane@example.com
Bob Wilson,+17654321098,bob@example.com
```

## 🎤 Voice Agent Behavior

The AI agent will:
- ✓ Greet the contact naturally
- ✓ Use knowledge base context
- ✓ Answer questions intelligently
- ✓ Handle interruptions gracefully
- ✓ End call professionally

## 💰 Cost Estimate

Retell AI Pricing (approximate):
- Per minute: $0.05 - $0.15
- Average call: 3 minutes
- Cost per call: ~$0.15 - $0.45

Example: 1000 calls × 3 min × $0.10/min = $300

## 📚 Learn More

- Full guide: `SIP_VOICE_INTEGRATION_GUIDE.md`
- Original setup: `VOICE_CAMPAIGN_QUICKSTART.md`
- Architecture: `VOICE_ARCHITECTURE.md`
- Retell docs: https://docs.retellai.com/

---

**Setup Time**: ~2 minutes  
**Status**: Production Ready ✓
