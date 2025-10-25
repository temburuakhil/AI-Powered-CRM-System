# Email Campaign with Attachments - Setup Guide

## 🚀 Quick Start

This guide will help you set up the complete email campaign system with file attachments and Google Sheets integration.

## ✨ Features

- ✅ AI-powered email content generation using Gemini API
- ✅ Send emails with knowledge base file attachments
- ✅ Real-time progress tracking
- ✅ Automatic status updates
- ✅ SMTP support (Gmail, Outlook, custom)
- ✅ Professional HTML email formatting

## 📋 Prerequisites

- Node.js installed (v14 or higher)
- Gmail account with App Password enabled (or other SMTP provider)
- Knowledge base files uploaded in CreateProject page

## 🔧 Setup Instructions

### Step 1: Install Backend Dependencies

Open a new terminal in the `backend` folder and run:

```powershell
cd backend
npm install
```

This will install:
- `express` - Web server framework
- `nodemailer` - Email sending library
- `cors` - Cross-origin resource sharing
- `googleapis` - Google Sheets API client
- `dotenv` - Environment variable management

### Step 2: Configure Environment Variables

The `.env` file is already created. You can add Google Sheets API credentials later if needed.

```env
PORT=3001
```

### Step 3: Start the Backend Server

In the backend folder terminal:

```powershell
npm start
```

You should see:
```
✅ Email backend server is running on http://localhost:3001
📧 Ready to send emails with attachments
🔗 Health check: http://localhost:3001/api/health
```

### Step 4: Start the Frontend

In your main project terminal (keep backend running):

```powershell
npm run dev
```

## 📧 Using the Email Campaign Feature

### 1. Navigate to a Project

1. Go to Admin Portal
2. Click on a Manager card
3. Click on a Project card
4. You'll see the ProjectDetail page with the Google Sheet data

### 2. Generate AI Content

1. Click the **"Email Campaign"** button (purple gradient)
2. Click **"Generate Email Content with AI"**
3. AI will automatically generate:
   - Professional subject line about the new project
   - Engaging email body notifying employees
   - Content mentioning attached knowledge base files

### 3. Configure SMTP

Fill in your email settings:

**For Gmail:**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
Email: your-email@gmail.com
Password: lvdw vemj mfrf hers (App Password)
```

**For Outlook/Office365:**
```
SMTP Host: smtp-mail.outlook.com
SMTP Port: 587
Email: your-email@outlook.com
Password: your-password
```

### 4. Review and Send

1. Review the generated subject and body (you can edit them)
2. Check that attachments are listed (knowledge base files)
3. Click **"Send to [X] Recipients"**
4. Watch the progress bar as emails are sent
5. Status automatically updates to "Completed" in Google Sheets

## 🎯 Email Content

The AI generates professional emails with:

- **Subject**: Announces the new project assignment
- **Body**: 
  - Project introduction
  - Assignment notification
  - Mention of attached documents
  - Call-to-action to review materials
  - Request for acknowledgment
  - Professional closing

**Example Subject:**
```
New Project Assignment: [Project Name] - Action Required
```

**Example Body:**
```
Dear Team Member,

We are excited to inform you that you have been assigned to a new project: "[Project Name]".

This project represents an important initiative for our team, and we're confident 
in your ability to contribute meaningfully to its success.

📎 Attached Documents:
We've attached all relevant knowledge base materials and documentation to help you 
get started. Please review these files carefully as they contain essential information 
about the project scope, requirements, and guidelines.

✅ Next Steps:
1. Review all attached documents thoroughly
2. Familiarize yourself with the project requirements
3. Confirm your availability and acknowledge receipt
4. Please respond within 24 hours

We look forward to your involvement in this project. If you have any questions or 
need clarification, please don't hesitate to reach out.

Best regards,
Project Team
```

## 🔐 SMTP Configuration

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Security → 2-Step Verification → Turn On

2. **Generate App Password**
   - Google Account → Security → App passwords
   - Select "Mail" and your device
   - Copy the 16-character password (e.g., "lvdw vemj mfrf hers")
   - Use this as your SMTP password

3. **SMTP Settings**
   ```
   Host: smtp.gmail.com
   Port: 587
   Email: your-email@gmail.com
   Password: [Your App Password]
   ```

### Other Email Providers

**Outlook/Hotmail:**
```
Host: smtp-mail.outlook.com
Port: 587
```

**Yahoo Mail:**
```
Host: smtp.mail.yahoo.com
Port: 587
```

**Custom SMTP:**
```
Host: [Your SMTP host]
Port: 587 or 465
```

## 📊 Google Sheets Integration

### Automatic Status Updates

After an email is successfully sent:
1. The status column changes to "Completed"
2. Updates are reflected in the UI immediately
3. Sheet updates happen via the parent component's `onStatusUpdate`

### Manual Sheet Updates (Optional)

For direct Google Sheets API integration:

1. **Enable Google Sheets API**
   - Go to Google Cloud Console
   - Enable Google Sheets API
   - Create OAuth 2.0 credentials or Service Account

2. **Add Credentials to `.env`**
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
   ```

3. **Share Sheet with Service Account**
   - Open your Google Sheet
   - Click "Share"
   - Add service account email with Editor access

## 📎 File Attachments

### Supported File Types

The system supports any file type uploaded as knowledge base:
- PDF documents (.pdf)
- Word documents (.doc, .docx)
- Excel spreadsheets (.xls, .xlsx)
- PowerPoint presentations (.ppt, .pptx)
- Images (.jpg, .png, .gif)
- Text files (.txt)
- And more...

### Upload Process

1. When creating a project, upload knowledge base files
2. Files are stored in localStorage as base64
3. When sending emails, files are attached automatically
4. Recipients receive all uploaded files with the email

### File Size Limits

- **Individual file**: Recommended max 10MB
- **Total attachments per email**: Max 25MB (Gmail limit)
- **localStorage total**: ~5-10MB per project recommended

## 🧪 Testing

### Test with Demo Recipients

1. Use your own email addresses in the Google Sheet
2. Set status to "Not Completed" for test rows
3. Send a test campaign
4. Verify:
   - Email received
   - Subject and body correct
   - Attachments present
   - Status updated to "Completed"

### Backend Health Check

Visit: `http://localhost:3001/api/health`

Expected response:
```json
{
  "status": "ok",
  "message": "Email backend is running"
}
```

## 🐛 Troubleshooting

### Backend Not Starting

**Error**: `Cannot find module 'express'`
- **Solution**: Run `npm install` in the backend folder

**Error**: `Port 3001 already in use`
- **Solution**: 
  - Change PORT in `.env` to another port (e.g., 3002)
  - Update frontend EmailCampaign.tsx to use new port

### Emails Not Sending

**Error**: "Invalid login credentials"
- **Gmail**: Use App Password, not account password
- **2FA**: Must be enabled for App Passwords
- **Solution**: Generate new App Password

**Error**: "Connection timeout"
- **Solution**: Check firewall/antivirus blocking port 587
- **Alternative**: Try port 465 with `secure: true`

### AI Content Not Generating

**Error**: "API key invalid"
- **Solution**: Verify Gemini API key in EmailCampaign.tsx
- Get new key from: https://makersuite.google.com/app/apikey

**Error**: "Failed to parse generated content"
- **Solution**: Try regenerating (AI response format varies)

### Attachments Not Working

**Error**: "Attachment too large"
- **Solution**: Reduce file sizes (compress PDFs, images)
- **Gmail limit**: 25MB total per email

**Error**: "Cannot read property 'data'"
- **Solution**: Ensure files are uploaded in CreateProject
- Check localStorage: `kb_{managerId}_{projectId}`

## 🔒 Security Best Practices

1. **Never commit credentials**
   - Keep `.env` in `.gitignore`
   - Use environment variables for sensitive data

2. **Use App Passwords**
   - Don't use main account password
   - Revoke unused App Passwords

3. **Limit Backend Access**
   - Use CORS to restrict origins
   - Add authentication for production

4. **Protect API Keys**
   - Store Gemini API key in environment variables for production
   - Rotate keys periodically

## 🚀 Production Deployment

### Backend Deployment

**Option 1: Vercel Serverless**
```bash
npm install -g vercel
cd backend
vercel
```

**Option 2: Railway**
```bash
# Push to GitHub
# Connect repo to Railway
# Add environment variables
```

**Option 3: Heroku**
```bash
heroku create your-app-name
git push heroku main
```

### Environment Variables

Set in production:
```env
PORT=3001
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
```

### Update Frontend

Change API URL in EmailCampaign.tsx:
```typescript
const response = await fetch('https://your-backend-url.com/api/send-email', {
  // ...
});
```

## 📈 Monitoring

### Email Logs

Check backend console for:
- SMTP connection verification
- Email send confirmations
- Message IDs
- Error messages

### Success Metrics

Track in the UI:
- Total recipients
- Emails sent successfully
- Failed attempts
- Progress percentage

## 🎉 Success Checklist

- [ ] Backend server running on port 3001
- [ ] Frontend running on port 8081
- [ ] Can access ProjectDetail page
- [ ] AI generates email content successfully
- [ ] SMTP configuration accepted
- [ ] Test email sent and received
- [ ] Attachments present in email
- [ ] Status updates to "Completed"
- [ ] Google Sheet reflects changes

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Google Sheets API Guide](https://developers.google.com/sheets/api)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Gemini API Docs](https://ai.google.dev/docs)

## 💡 Tips

1. **Test First**: Always test with your own email before sending to many recipients
2. **Check Spam**: First emails might go to spam folder
3. **Warm Up**: Start with small batches (5-10 emails) before sending hundreds
4. **Monitor Limits**: Gmail has daily sending limits (500/day for free accounts)
5. **Backup Data**: Keep spreadsheet backups before bulk operations

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review backend console logs
3. Verify all credentials are correct
4. Ensure both servers are running
5. Test with a single recipient first

---

**Ready to Send?** Follow the steps above and your email campaign system will be fully operational! 🚀📧
