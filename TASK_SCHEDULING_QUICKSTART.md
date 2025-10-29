# Task Scheduling & Google Calendar Integration - Quick Start

## 🎯 Overview
Tasks in the Kanban board now support **start/end dates with time** and automatically create **Google Calendar events** with email invitations!

---

## ✨ Features

### 1. Task Scheduling
- ✅ Set **Start Date & Time** for task beginning
- ✅ Set **End Date & Time** (deadline) for completion
- ✅ Visual indicators on task cards showing schedule
- ✅ Color-coded timeline (green for start, red for deadline)

### 2. Automatic Calendar Events
- ✅ Creates Google Calendar event when dates are provided
- ✅ Sends email invitation to assigned team member
- ✅ Sets automatic reminders:
  - 📧 Email reminder 1 day before
  - 🔔 Popup reminder 30 minutes before
- ✅ Links calendar event to task (shows "Synced to Calendar" badge)

### 3. Email Notifications
- ✅ **Assignment Email**: Sent when task is assigned to someone
- ✅ **Completion Email**: Sent to temburuakhil@gmail.com when task is done
- ✅ Professional HTML formatted emails with full task details

---

## 🚀 Quick Setup

### Step 1: Configure Google Calendar API (One-time)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Run the OAuth helper script
node get-refresh-token.js
```

This will:
1. Open your browser automatically
2. Ask you to sign in with Google
3. Grant calendar permissions
4. Generate a refresh token
5. Display the token in terminal

### Step 2: Update .env File

Copy the refresh token and add to `backend/.env`:

```properties
PORT=3001

# Google Calendar API Configuration
GOOGLE_CLIENT_ID=your_actual_client_id
GOOGLE_CLIENT_SECRET=your_actual_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/oauth2callback
GOOGLE_REFRESH_TOKEN=your_actual_refresh_token
```

### Step 3: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project (or select existing)
3. Enable **Google Calendar API**
4. Create **OAuth 2.0 Client ID** credentials
5. Add redirect URI: `http://localhost:3001/oauth2callback`
6. Copy Client ID and Client Secret to `.env`

### Step 4: Restart Backend

```bash
cd backend
node server.js
```

---

## 📋 How to Use

### Creating a Scheduled Task

1. **Open Kanban Board** from project dashboard
2. **Click "+" button** in any column (TODO, IN PROGRESS, DONE)
3. **Fill in task details**:
   - Task Title (required)
   - Description (optional)
   - Assignee (optional)
4. **Click "Add Task"**
5. **Edit the task** (hover and click blue edit icon)
6. **Fill in Schedule & Deadline section**:
   ```
   Start Date: 2025-10-30
   Start Time: 14:00
   End Date: 2025-10-30
   End Time: 16:00
   ```
7. **Assign to team member** (their email must be in Google Sheets)
8. **Click "Save Changes"**

### What Happens Automatically:

✅ **Task Updated** with schedule information
✅ **Google Calendar Event** created instantly
✅ **Email Invitation** sent to assignee
✅ **Green indicator** "Google Calendar event will be created automatically"
✅ **Calendar badge** appears on task card
✅ **Success toast** notification shown

---

## 🎨 Task Card Display

Tasks with schedules show:

```
📝 Task Title
   Description text...
   
   ▶ Start: 2025-10-30 14:00
   ⏹ Due: 2025-10-30 16:00
   📅 Synced to Calendar
   
   👤 John Doe
```

- **Green arrow** (▶) = Start time
- **Red square** (⏹) = Deadline
- **Calendar icon** (📅) = Successfully synced to Google Calendar
- **Avatar** = Assigned team member

---

## 📧 Email Notifications

### 1. Task Assignment Email
Sent to: **Assignee's email** (from Google Sheets)

```
Subject: New Task Assigned: [Task Title]

Hello [Assignee Name],

You have been assigned a new task in the project management system.

Task Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: [Task Title]
Description: [Description]
Project: [Project ID]
Assigned Date: [Date & Time]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please log in to the project management system to view full details.
```

### 2. Task Completion Email
Sent to: **temburuakhil@gmail.com**

```
Subject: ✅ Task Completed: [Task Title]

Task Completion Notification

Task Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: [Task Title]
Description: [Description]
Completed By: [Assignee Name]
Completion Date: [Date & Time]
Project: [Project ID]
Manager: [Manager ID]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This task has been successfully completed and moved to the DONE column.
```

---

## 🔧 Troubleshooting

### ❌ "Calendar authentication failed"

**Solution:**
```bash
# Regenerate refresh token
cd backend
node get-refresh-token.js
```

### ❌ "No email found for assignee"

**Causes:**
- Assignee email not in Google Sheets
- Email column not detected (should have "email" in header)
- No assignee selected

**Solution:** Make sure Google Sheets has an "Email" column with valid emails

### ❌ Calendar event not created

**Check:**
1. Backend server running? (`node server.js`)
2. Google Calendar API enabled?
3. Valid credentials in `.env`?
4. All 4 date/time fields filled?
5. Backend console for error messages

### ❌ Event created but no invitation sent

**Cause:** Assignee has no email in Google Sheets

**Solution:** Add email for that team member in your Google Sheets data

---

## 🎯 Best Practices

### 1. Always Fill All Date/Time Fields
```
✅ Start Date: 2025-10-30
✅ Start Time: 14:00
✅ End Date: 2025-10-30
✅ End Time: 16:00
```

Calendar events only created when **all 4 fields** are filled.

### 2. Assign After Scheduling
1. First set dates/times
2. Then assign to team member
3. Save changes

This ensures the calendar invitation includes the assignee.

### 3. Use Realistic Time Zones
Default timezone: **Asia/Kolkata** (IST)

Edit in `KanbanBoard.tsx` line ~405:
```javascript
timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
```

### 4. Check Email Column
Your Google Sheets must have an **Email** column:

```csv
Name,Email,Phone
John Doe,john@example.com,+1234567890
Jane Smith,jane@example.com,+1234567891
```

---

## 🔐 Security Notes

⚠️ **Important:**
- Never commit `.env` file to Git (already in `.gitignore`)
- Keep refresh token secure
- Refresh tokens don't expire unless revoked
- Use different credentials for production
- Consider service accounts for production deployment

---

## 📊 Testing Checklist

- [ ] Backend server running on port 3001
- [ ] Google Calendar API enabled
- [ ] OAuth credentials configured
- [ ] Refresh token generated and in `.env`
- [ ] Google Sheets has Email column
- [ ] Create test task with dates
- [ ] Assign to team member
- [ ] Check Google Calendar for event
- [ ] Check assignee's email for invitation
- [ ] Move task to DONE column
- [ ] Check temburuakhil@gmail.com for completion email

---

## 📚 Additional Resources

- **Full Setup Guide**: See `GOOGLE_CALENDAR_SETUP.md`
- **OAuth Helper Script**: `backend/get-refresh-token.js`
- **Backend API**: `http://localhost:3001/api/create-calendar-event`
- **Google Cloud Console**: https://console.cloud.google.com/
- **OAuth Playground**: https://developers.google.com/oauthplayground/

---

## 💡 Pro Tips

1. **Bulk Calendar Sync**: Edit multiple tasks to add schedules quickly
2. **Recurring Tasks**: Create in Google Calendar, not Kanban (for now)
3. **Time Zones**: System auto-detects your local timezone
4. **Calendar Colors**: Customize in `server.js` (add `colorId` property)
5. **Event Locations**: Add meeting rooms in `server.js` (add `location` property)

---

**Setup complete!** 🎉 Your tasks now sync with Google Calendar automatically!

For issues, check:
- Backend console logs
- Google Cloud Console API quota
- `.env` file configuration
- Email exists in Google Sheets
