# Email Campaign Feature - Quick Start

## ✅ Implementation Complete!

### What's New:
- 🤖 **AI-Powered Email Generation** using Gemini API
- 📧 **Automated Email Campaigns** with SMTP support  
- ✅ **Auto-Status Updates** (Not Completed → Completed)
- 📊 **Real-time Progress Tracking**

---

## How to Use (Step-by-Step)

### 1. **Navigate to Project**
- Go to Admin Portal
- Click any manager
- Click any project
- You'll see the project data from Google Sheets

### 2. **Open Email Campaign**
- Look for the **"Email Campaign"** button in the header (purple/pink gradient)
- Badge shows number of recipients (those with "Not Completed" status)
- Click to open the campaign dialog

### 3. **Generate AI Content**
- **Get Gemini API Key**:
  - Visit: https://makersuite.google.com/app/apikey
  - Sign in and create API key
  - Copy the key
  
- **Paste in Dialog**:
  - Enter key in "Gemini API Key" field
  - Click "Generate Email Content"
  - Wait 2-3 seconds
  - AI creates professional subject + body

### 4. **Configure Email Settings**
- **For Gmail** (recommended):
  ```
  Email: your.email@gmail.com
  Password: [16-digit App Password]
  Host: smtp.gmail.com
  Port: 587
  ```
  
  **Get App Password**:
  1. Enable 2FA on Google Account
  2. Visit: https://myaccount.google.com/apppasswords
  3. Generate app password
  4. Use that instead of regular password

- **For Other Providers**: See EMAIL_CAMPAIGN_GUIDE.md

### 5. **Review & Edit**
- Review AI-generated subject
- Edit email body if needed
- Personalize content
- Check recipient count

### 6. **Send Emails**
- Click "Send to X Recipients"
- Watch progress bar
- See sent/failed counts
- Status automatically updates to "Completed"

---

## Quick Example

**Your Google Sheet**:
```
| Name  | Email            | Status        |
|-------|------------------|---------------|
| John  | john@test.com    | Not Completed |
| Jane  | jane@test.com    | Completed     |
| Bob   | bob@test.com     | Not Completed |
```

**What Happens**:
1. Campaign finds 2 recipients (John, Bob) - Jane is skipped
2. AI generates:
   - Subject: "Complete Your Registration Today!"
   - Body: Professional follow-up email
3. Sends emails to John and Bob
4. Updates their status to "Completed"
5. Jane is unchanged (already completed)

**Result**:
- ✅ 2 emails sent
- ✅ Statuses updated locally
- ✅ Progress tracked in real-time

---

## Sheet Requirements

### Required Columns:
1. **Status Column** (default: "Status")
   - Values: "Not Completed", "Completed"
   - Case-insensitive
   
2. **Email Column** (default: "Email")
   - Valid email addresses with @
   - Invalid/empty emails skipped

### Custom Column Names:
```tsx
<EmailCampaign
  data={data}
  statusColumn="YourStatusColumn"  // Change if needed
  emailColumn="YourEmailColumn"    // Change if needed
  onStatusUpdate={handleStatusUpdate}
/>
```

---

## Important Notes

### 🔴 Current Status: **Demo Mode**
- Simulates email sending with delays
- Updates status locally only
- **No actual emails sent yet**

### 🟢 For Production:
1. Set up backend email server (see guide)
2. Uncomment API call in EmailCampaign.tsx (~line 200)
3. Deploy backend to handle SMTP
4. Test thoroughly with small batches

---

## Features Breakdown

### AI Content Generation (Gemini)
- ✅ Professional subject lines (max 50 chars)
- ✅ Compelling email bodies (200-300 words)
- ✅ Context-aware content
- ✅ Call-to-action included
- ✅ Friendly tone

### Email Sending
- ✅ SMTP configuration UI
- ✅ Gmail App Password support
- ✅ Custom SMTP servers
- ✅ Batch processing
- ✅ Error handling

### Progress Tracking
- ✅ Real-time progress bar
- ✅ Sent count
- ✅ Failed count
- ✅ Success/error toasts
- ✅ Auto-close on complete

### Status Management
- ✅ Auto-filter "Not Completed"
- ✅ Update to "Completed" after send
- ✅ Local data sync
- ✅ Visual confirmation

---

## Troubleshooting

### "No Recipients Found"
- ✅ Check Status column exists
- ✅ Verify status values ("Not Completed")
- ✅ Ensure Email column has valid emails

### "SMTP Authentication Failed"
- ✅ Use App Password for Gmail (not account password)
- ✅ Check email/password for typos
- ✅ Verify SMTP host and port

### "Gemini API Error"
- ✅ Check API key is correct
- ✅ No extra spaces in key
- ✅ API enabled in Google Cloud

### "Emails Not Sending"
- ⚠️ Currently in demo mode
- ⚠️ Set up backend for production
- ⚠️ See EMAIL_CAMPAIGN_GUIDE.md

---

## Next Steps

### For Testing:
1. Create a test Google Sheet
2. Add Status and Email columns
3. Add some test data
4. Get Gemini API key
5. Try generating content
6. Review the UI flow

### For Production:
1. Read EMAIL_CAMPAIGN_GUIDE.md
2. Set up Node.js backend OR
3. Use serverless function OR
4. Use email service API (SendGrid, etc.)
5. Update EmailCampaign.tsx
6. Test with your email first
7. Deploy and monitor

---

## File Locations

```
src/
├── components/
│   ├── EmailCampaign.tsx          ← Main component
│   └── ui/
│       ├── dialog.tsx             ← Created
│       └── textarea.tsx           ← Created
│
├── pages/
│   └── ProjectDetail.tsx          ← Integrated here
│
└── docs/
    └── EMAIL_CAMPAIGN_GUIDE.md    ← Full documentation
```

---

## API Keys Needed

1. **Gemini API**:
   - Get from: https://makersuite.google.com/app/apikey
   - Free tier: 60 requests/minute
   - Cost: Free for basic usage

2. **Gmail App Password** (if using Gmail):
   - Get from: https://myaccount.google.com/apppasswords
   - Requires 2FA enabled
   - Free

---

## Security Reminders

⚠️ **Never commit**:
- API keys
- SMTP passwords
- Email credentials

✅ **Use**:
- Environment variables
- Backend for email sending
- Secure storage

---

## Support

Questions? Check:
1. EMAIL_CAMPAIGN_GUIDE.md (full docs)
2. Browser console (errors)
3. SMTP provider docs
4. Gemini API docs

---

**Status**: ✅ Feature Complete (Demo Mode)  
**Production Ready**: ⚠️ Needs backend setup  
**Version**: 1.0.0  
**Date**: October 20, 2025
