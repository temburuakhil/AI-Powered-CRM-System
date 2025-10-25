# Email Campaign Feature - Implementation Guide

## Overview
Implemented AI-powered email campaign system with:
- **Gemini API** for intelligent email content generation
- **SMTP** support for sending emails
- **Auto-status update** to "Completed" after sending
- **Progress tracking** with real-time updates

## ✅ Features Implemented

### 1. **AI Email Content Generation (Gemini API)**
- Generate professional email subject lines
- Create personalized email bodies
- Context-aware content based on campaign purpose
- One-click generation

### 2. **Email Campaign Management**
- Send emails to recipients with "Not Completed" status
- Automatic recipient filtering
- SMTP configuration interface
- Progress tracking with success/failure counts

### 3. **Status Auto-Update**
- Changes status from "Not Completed" to "Completed" after email sent
- Real-time local data update
- Visual confirmation

### 4. **User Interface**
- Beautiful gradient-themed dialog
- Three-section layout:
  1. AI Content Generation (Purple/Pink)
  2. SMTP Configuration (Blue/Cyan)
  3. Email Content Editor (Green/Teal)
- Progress bar during sending
- Recipients counter badge

## Component Structure

### EmailCampaign Component
**Location**: `src/components/EmailCampaign.tsx`

**Props**:
```typescript
interface EmailCampaignProps {
  data: Record<string, any>[];      // Sheet data
  statusColumn: string;              // Column name for status (e.g., "Status")
  emailColumn: string;               // Column name for emails (e.g., "Email")
  onStatusUpdate: (data) => void;   // Callback after status update
}
```

**Usage in ProjectDetail**:
```tsx
<EmailCampaign
  data={data}
  statusColumn="Status"
  emailColumn="Email"
  onStatusUpdate={handleStatusUpdate}
/>
```

## Setup Instructions

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key
5. Paste in the "Gemini API Key" field in the Email Campaign dialog

**API Endpoint Used**:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

### 2. Configure SMTP (Gmail Example)

#### For Gmail Users:

1. **Enable 2-Factor Authentication**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Visit [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device
   - Click "Generate"
   - Copy the 16-character password

3. **Enter in Dialog**:
   - Email: `your.email@gmail.com`
   - App Password: `xxxx xxxx xxxx xxxx` (the generated password)
   - SMTP Host: `smtp.gmail.com` (default)
   - Port: `587` (default)

#### For Other Email Providers:

**Outlook/Hotmail**:
- Host: `smtp-mail.outlook.com`
- Port: `587`
- Use your Microsoft account password

**Yahoo**:
- Host: `smtp.mail.yahoo.com`
- Port: `587`
- Generate app password from Yahoo Account Security

**Custom Domain**:
- Contact your email provider for SMTP settings
- Usually requires host, port, username, password

### 3. Backend Setup for Email Sending

The component is currently set up for demonstration. For **production use**, you need to set up a backend endpoint to handle actual email sending.

#### Option A: Node.js Backend with Nodemailer

Create a simple Express server:

```javascript
// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/send-email', async (req, res) => {
  const { to, subject, body, smtp } = req.body;
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: false,
      auth: {
        user: smtp.user,
        pass: smtp.password,
      },
    });

    // Send email
    await transporter.sendMail({
      from: smtp.user,
      to: to,
      subject: subject,
      text: body,
      html: `<div style="font-family: Arial, sans-serif;">${body.replace(/\n/g, '<br>')}</div>`,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Email server running on port 3001');
});
```

**Install dependencies**:
```bash
npm install express nodemailer body-parser cors
```

**Run**:
```bash
node server.js
```

**Update EmailCampaign.tsx** (line ~200):
```typescript
const response = await fetch('http://localhost:3001/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(emailPayload),
});

if (!response.ok) throw new Error('Email send failed');
```

#### Option B: Serverless Function (Vercel)

Create `api/send-email.js`:

```javascript
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, body, smtp } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: false,
      auth: {
        user: smtp.user,
        pass: smtp.password,
      },
    });

    await transporter.sendMail({
      from: smtp.user,
      to: to,
      subject: subject,
      text: body,
      html: `<div style="font-family: Arial, sans-serif;">${body.replace(/\n/g, '<br>')}</div>`,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

Deploy to Vercel and update the URL in EmailCampaign.tsx.

#### Option C: Use Email Service API

**SendGrid**:
```typescript
const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    personalizations: [{ to: [{ email: recipient }] }],
    from: { email: smtpConfig.user },
    subject: emailSubject,
    content: [{ type: 'text/plain', value: emailBody }],
  }),
});
```

**Mailgun**, **AWS SES**, **Postmark** - Similar API-based approaches.

## Data Flow

```
1. User clicks "Email Campaign" button
          ↓
2. Dialog opens → Shows recipients count (Not Completed)
          ↓
3. User enters Gemini API key
          ↓
4. Clicks "Generate Email Content"
          ↓
5. AI generates subject + body
          ↓
6. User enters SMTP credentials
          ↓
7. User reviews/edits email content
          ↓
8. Clicks "Send to X Recipients"
          ↓
9. For each recipient:
   - Send email via SMTP
   - Update status to "Completed"
   - Update progress bar
          ↓
10. Show success toast with sent/failed counts
          ↓
11. Dialog auto-closes after 2 seconds
```

## Status Column Requirements

The component expects a column in your Google Sheet for status tracking:

**Required Column**: `Status` (or custom name via props)

**Expected Values**:
- `"Not Completed"` → Will receive email
- `"Completed"` → Will be skipped
- Case-insensitive matching

**Example Sheet Structure**:
```
| Name    | Email              | Status         |
|---------|-------------------|----------------|
| John    | john@example.com  | Not Completed  |
| Jane    | jane@example.com  | Completed      |
| Bob     | bob@example.com   | Not Completed  |
```

After sending, John and Bob's status will change to "Completed".

## Email Column Requirements

**Required Column**: `Email` (or custom name via props)

**Validation**:
- Must contain `@` symbol
- Invalid emails automatically skipped
- Empty emails skipped

## Gemini API Prompt

The AI generates content using this prompt:

```
Generate a professional email for a follow-up campaign. 
Context: We need to send emails to people who haven't completed their registration/application process.

Please provide:
1. A compelling subject line (max 50 characters)
2. A professional and friendly email body (200-300 words) that:
   - Reminds them about the incomplete process
   - Encourages them to complete it
   - Provides a sense of urgency without being pushy
   - Includes a clear call-to-action
   - Has a professional tone

Format the response as:
SUBJECT: [subject line]
BODY: [email body]
```

**Example Output**:
```
SUBJECT: Complete Your Registration - Quick & Easy!

BODY: Dear Valued User,

We noticed you started your registration with us but haven't completed it yet. We'd love to have you fully onboard!

Completing your profile takes just 2 minutes and unlocks access to all our premium features...

[Rest of email]
```

## Customization

### Change Status Values

Edit line ~30 in EmailCampaign.tsx:

```typescript
const recipients = data.filter(
  (row) => 
    row[statusColumn]?.toString().toLowerCase() !== "completed" && // Change "completed"
    row[emailColumn] &&
    row[emailColumn].includes("@")
);
```

### Customize AI Prompt

Edit the `generateEmailContent` function (~line 60):

```typescript
text: `Your custom prompt here...`
```

### Add CC/BCC

Modify the email sending section (~line 183):

```typescript
const emailPayload = {
  to: recipient[emailColumn],
  cc: 'manager@company.com',
  bcc: 'admin@company.com',
  subject: emailSubject,
  body: emailBody,
  // ...
};
```

### Add Attachments

Extend emailPayload:

```typescript
attachments: [
  {
    filename: 'document.pdf',
    path: '/path/to/file.pdf',
  }
]
```

## Error Handling

### Common Errors:

1. **"SMTP Authentication Failed"**
   - Check email and password
   - For Gmail, use App Password, not account password
   - Enable "Less secure app access" if needed

2. **"Gemini API Key Invalid"**
   - Verify API key from Google AI Studio
   - Check for extra spaces
   - Ensure API is enabled

3. **"No Recipients Found"**
   - Check Status column name matches props
   - Verify status values (case-insensitive)
   - Ensure Email column has valid emails

4. **"Email Send Failed"**
   - Check internet connection
   - Verify SMTP host and port
   - Check firewall/antivirus settings

## Security Considerations

⚠️ **Important**: 

1. **Never commit SMTP credentials** to version control
2. **Store API keys securely** (environment variables)
3. **Use backend for email sending** in production
4. **Implement rate limiting** to prevent abuse
5. **Validate email addresses** before sending
6. **Add unsubscribe links** for compliance
7. **Follow CAN-SPAM/GDPR** regulations

## Production Checklist

- [ ] Set up backend email endpoint
- [ ] Store credentials in environment variables
- [ ] Implement error logging
- [ ] Add email sending rate limits
- [ ] Test with small batch first
- [ ] Add email templates
- [ ] Implement bounce handling
- [ ] Add unsubscribe mechanism
- [ ] Monitor email deliverability
- [ ] Set up email analytics

## Future Enhancements

- [ ] Email templates library
- [ ] Schedule sending for later
- [ ] A/B testing for subject lines
- [ ] Email open tracking
- [ ] Click tracking
- [ ] Batch sending (chunks of 10-50)
- [ ] Retry failed sends
- [ ] Email preview before sending
- [ ] Personalization variables ({{name}}, etc.)
- [ ] Attachment support

## Testing

### Test Mode (Current Implementation):
- Simulates email sending with 500ms delay
- Updates status locally
- Shows progress animation
- No actual emails sent

### Production Mode:
- Uncomment API call section (~line 200)
- Set up backend endpoint
- Test with your own email first
- Start with small recipient list

## Support

For issues:
1. Check browser console for errors
2. Verify API keys and SMTP credentials
3. Test email sending with online tools first
4. Check spam folder for sent emails
5. Review backend logs if using custom server

---
**Version**: 1.0.0  
**Last Updated**: October 20, 2025  
**Status**: ✅ Ready for Production (with backend setup)
