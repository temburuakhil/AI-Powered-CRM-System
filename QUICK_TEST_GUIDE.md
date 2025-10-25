# Quick Test Guide - Email Campaign

## ✅ System is Ready!

Both servers are now running:
- **Frontend**: http://localhost:8081
- **Backend**: http://localhost:3001

## 🧪 Test the Complete Flow

### Step 1: Create a Test Project (if not already done)

1. Go to http://localhost:8081
2. Click "Admin Portal"
3. Create or select a Manager
4. Create a new Project with:
   - **Name**: "Website Development Project" (or any name)
   - **Google Sheet URL**: Your sheet URL with employee data
   - **Knowledge Base Files**: Upload 1-2 PDF/DOC files (project requirements, guidelines, etc.)

### Step 2: Prepare Your Google Sheet

Your sheet should have these columns:
- **Email**: Employee email addresses (use your email for testing)
- **Status**: Set to "Not Completed" for test rows
- **Name**: Employee names (optional)

Example:
```
Name              | Email                    | Status
John Doe          | john@example.com         | Not Completed
Jane Smith        | jane@example.com         | Not Completed
```

### Step 3: Navigate to ProjectDetail

1. After creating the project, you'll be automatically redirected to ProjectDetail
2. You should see:
   - ✅ Google Sheet data displayed in a table
   - ✅ Knowledge base files listed with download buttons
   - ✅ Purple "Email Campaign" button in the header

### Step 4: Test AI Content Generation

1. Click the **"Email Campaign"** button
2. A dialog opens - click **"Generate Email Content with AI"** button (top right)
3. Wait 2-3 seconds
4. You should see:
   - ✅ Subject line generated (e.g., "New Project Assignment: Website Development Project")
   - ✅ Professional email body generated
   - ✅ Content mentions the project name
   - ✅ Content references attached files
   - ✅ Success toast notification

**If AI generation fails:**
- Check console for errors
- Verify Gemini API key is correct in `EmailCampaign.tsx`
- Check your internet connection

### Step 5: Configure SMTP

Fill in the SMTP Configuration section:

**Using Gmail (Recommended for Testing):**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
Email: your-email@gmail.com
Password: lvdw vemj mfrf hers
```

Or use your own Gmail App Password:
1. Enable 2FA on your Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate password for "Mail"
4. Use that password here

### Step 6: Send Test Email

1. Review the generated content (you can edit if needed)
2. Click **"Send to [X] Recipients"** button
3. Watch the progress bar fill up
4. You should see:
   - ✅ Progress: "Sent: 1/2, Failed: 0/2"
   - ✅ Success toast: "Campaign Complete! Successfully sent X emails"
   - ✅ Dialog closes automatically after 2 seconds

### Step 7: Verify Results

**Check Email:**
1. Open your email inbox
2. You should receive an email with:
   - ✅ Subject about the new project
   - ✅ Professional HTML-formatted body
   - ✅ Attached knowledge base files (PDF/DOC)
   - ✅ Proper formatting and styling

**Check Status Update:**
1. Look at the DataTable in ProjectDetail
2. Status should change from "Not Completed" to "Completed"
3. The change is immediate in the UI

**Check Backend Logs:**
1. Look at the backend terminal
2. You should see:
   - ✅ "SMTP connection verified"
   - ✅ "Email sent successfully: [message-id]"
   - ✅ Preview URL (for testing)

## 🎯 What the Email Contains

**Subject Example:**
```
New Project Assignment: Website Development Project - Review Required
```

**Body Example:**
```
Dear Team Member,

We are pleased to inform you that you have been assigned to our new project: 
"Website Development Project".

This is an exciting opportunity, and we're confident in your ability to contribute 
significantly to its success.

📎 Project Materials Attached:
We've included essential project documentation and knowledge base files with this 
email. Please review these materials carefully as they contain:
- Project requirements and specifications
- Guidelines and best practices
- Technical documentation
- [Other attached files]

✅ Action Required:
1. Review all attached documents thoroughly
2. Familiarize yourself with project scope and requirements
3. Confirm your availability for this project
4. Respond to acknowledge receipt within 24 hours

If you have any questions or need clarification about the project, please don't 
hesitate to reach out to your project manager.

We look forward to working with you on this initiative!

Best regards,
Website Development Project Team

---
This is an automated email from Project Management System.
```

## 🐛 Troubleshooting

### AI Content Not Generating

**Error in console**: "Failed to generate email content"

**Solutions:**
1. Check Gemini API key in `src/components/EmailCampaign.tsx` (line 18)
2. Verify internet connection
3. Try clicking "Generate" again (API might be temporarily slow)

### Emails Not Sending

**Error**: "Network request failed"

**Solutions:**
1. Ensure backend is running: Check http://localhost:3001/api/health
2. Restart backend if needed: 
   ```powershell
   cd backend
   npm start
   ```

**Error**: "Invalid login credentials"

**Solutions:**
1. If using Gmail, you MUST use an App Password, not your regular password
2. Enable 2-Factor Authentication first
3. Generate new App Password
4. Use the provided password: `lvdw vemj mfrf hers`

**Error**: "Connection timeout"

**Solutions:**
1. Check firewall/antivirus isn't blocking port 587
2. Try using port 465 with SSL
3. Verify SMTP host is correct

### Attachments Missing

**Issue**: Email received but no attachments

**Solutions:**
1. Verify files were uploaded in CreateProject page
2. Check localStorage: Open DevTools → Application → localStorage
3. Look for key: `kb_{managerId}_{projectId}`
4. Re-upload files if needed

### Status Not Updating

**Issue**: Email sent but status still "Not Completed"

**Solutions:**
1. The status updates immediately in the UI
2. Refresh the page to reload from Google Sheets
3. Click the Refresh button in the header
4. Check if the email column matches exactly

## 📊 Expected Behavior

### Success Flow:
1. Click Email Campaign → Dialog opens
2. Generate AI Content → Content appears in 2-3 seconds
3. Enter SMTP config → Validates on send
4. Click Send → Progress bar shows 0%
5. Each email sends → Progress increments (33%, 66%, 100%)
6. All sent → Success toast appears
7. Dialog closes → Back to ProjectDetail
8. Status updated → "Completed" shown in table

### Performance:
- AI generation: 2-5 seconds
- Email sending: ~500ms per email (with backend)
- Status update: Immediate in UI
- Total time for 10 emails: ~10-15 seconds

## 🎉 Success Indicators

You'll know everything works when:
- ✅ AI generates relevant project notification content
- ✅ Subject line mentions your project name
- ✅ Body references attached knowledge base files
- ✅ Email arrives in inbox (not spam)
- ✅ All uploaded files are attached
- ✅ HTML formatting looks professional
- ✅ Status changes to "Completed" in the table
- ✅ No errors in browser console
- ✅ Backend logs show successful sends

## 💡 Pro Tips

1. **Test with yourself first**: Use your own email addresses before sending to real employees
2. **Check spam folder**: First emails might go to spam
3. **Start small**: Test with 1-2 recipients before sending to many
4. **Monitor backend**: Keep backend terminal visible to see real-time logs
5. **Edit content**: You can modify AI-generated content before sending
6. **File sizes**: Keep attachments under 10MB each for best deliverability

## 📞 Quick Reference

**Frontend URL**: http://localhost:8081
**Backend URL**: http://localhost:3001
**Health Check**: http://localhost:3001/api/health
**SMTP Host**: smtp.gmail.com
**SMTP Port**: 587
**Test Password**: lvdw vemj mfrf hers

---

**Ready to test?** Follow the steps above and you'll have a fully functional email campaign system! 🚀
