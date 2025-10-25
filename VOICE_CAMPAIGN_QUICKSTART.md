# Retell AI Voice Integration - Quick Start 🚀

## 5-Minute Setup Guide

### Prerequisites
- Retell AI account ([retellai.com](https://retellai.com))
- Backend server running (`npm start` in backend folder)

---

## Step 1: Get Retell Credentials (2 min)

### A. API Key
1. Go to [dashboard.retellai.com/dashboard/api-keys](https://dashboard.retellai.com/dashboard/api-keys)
2. Click "Create API Key"
3. Copy: `key_xxxxxxxxxxxxx`

### B. Phone Number
1. Go to **Dashboard → Phone Numbers**
2. Click "Purchase Number"
3. Copy: `+14157774444`

### C. Agent ID
1. Go to **Dashboard → Agents**
2. Click "Create Agent" (or use existing)
3. Configure voice and prompt
4. Copy: `agent_xxxxxxxxxxxxx`

---

## Step 2: Start Backend (1 min)

```bash
cd backend
npm install  # First time only
npm start    # Starts on port 3001
```

Look for:
```
✅ Email backend server is running
📞 Retell AI voice calling enabled
```

---

## Step 3: Use Voice Campaign (2 min)

1. **Open Your Project**
   - Navigate to any project with phone numbers in data

2. **Click "Voice Campaign" Button**
   - Purple/pink gradient button next to Email Campaign

3. **Fill in Configuration**
   ```
   Retell API Key:  key_xxxxxxxxxxxxx
   From Number:     +14157774444
   Agent ID:        agent_xxxxxxxxxxxxx
   ```

4. **Optional: Add Variables**
   ```json
   {
     "customer_name": "{{name}}",
     "product": "Premium Plan"
   }
   ```

5. **Click "Start Voice Campaign"**
   - Watch progress in real-time
   - View call logs

---

## Quick Test

### Test with Your Number

1. Create a test sheet with your phone number:
   ```
   | Name  | Phone         | Status        |
   |-------|---------------|---------------|
   | Test  | +1YOURNUMBER  | Not Completed |
   ```

2. Run campaign with 1 recipient
3. Answer your phone
4. Talk to AI agent!

---

## Troubleshooting

### "Backend not responding"
```bash
cd backend
npm start
# Check port 3001 is free
```

### "Invalid from number"
- Must start with `+`
- Example: `+14157774444`
- Must be purchased from Retell

### "Failed to create call"
- Check API key is correct
- Verify phone number is active
- Ensure destination number is valid

---

## Phone Number Formats Supported

| Format            | ✅ Supported |
|-------------------|-------------|
| `+14155551234`    | ✅ Yes       |
| `4155551234`      | ✅ Yes (auto-converts) |
| `415-555-1234`    | ✅ Yes (auto-converts) |
| `(415) 555-1234`  | ✅ Yes (auto-converts) |

---

## Cost Estimate

**Example Campaign:**
```
100 calls × 2 min avg × $0.10/min = $20
```

**Tips to Save:**
- Keep calls under 2 minutes
- Filter recipients carefully
- Test with small batches first

---

## Component Props

```tsx
<VoiceCampaign
  data={sheetData}              // Required: Array of records
  phoneColumn="Phone"           // Required: Column with phone numbers
  statusColumn="Status"         // Optional: Status tracking column
  onStatusUpdate={handleUpdate} // Optional: Callback function
  projectName="My Project"      // Optional: For metadata
/>
```

---

## API Endpoint

```javascript
POST http://localhost:3001/api/retell/create-call

Body:
{
  "apiKey": "key_xxx",
  "fromNumber": "+14157774444",
  "toNumber": "+14155551234",
  "agentId": "agent_xxx",
  "metadata": { "project_name": "Campaign" },
  "dynamicVariables": { "customer_name": "John" }
}

Response:
{
  "success": true,
  "call_id": "xxx",
  "call_status": "registered"
}
```

---

## Features

✅ Bulk calling  
✅ Real-time progress  
✅ Success/fail tracking  
✅ Call logs  
✅ Pause/Resume  
✅ Auto status update  
✅ Dynamic variables  
✅ E.164 auto-format  

---

## Next Steps

1. ✅ Test with your phone number
2. ✅ Configure AI agent prompt
3. ✅ Run small test campaign (5-10 calls)
4. ✅ Review transcripts in Retell Dashboard
5. ✅ Scale to production

---

## Resources

- **Full Guide**: `RETELL_AI_VOICE_INTEGRATION.md`
- **Retell Docs**: [docs.retellai.com](https://docs.retellai.com)
- **Dashboard**: [dashboard.retellai.com](https://dashboard.retellai.com)
- **Support**: support@retellai.com

---

## ⚠️ Important Notes

- **Compliance**: Get consent before calling
- **Testing**: Always test before production
- **Rate Limit**: 2-second delay between calls
- **Hours**: Call during business hours only
- **Records**: Keep logs of all campaigns

---

**Ready to Make Calls?** 📞

Open your project → Click "Voice Campaign" → Fill in credentials → Start calling!

---

**Version**: 1.0.0  
**Last Updated**: October 21, 2025
