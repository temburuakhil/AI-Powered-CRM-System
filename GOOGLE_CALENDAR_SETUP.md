# Google Calendar Integration Setup Guide

## Overview
Tasks with start/end dates and times automatically create Google Calendar events with email invitations to assignees.

## Features
- ✅ Automatic calendar event creation when dates are set
- ✅ Email invitations sent to assignees
- ✅ Event reminders (1 day before + 30 min before)
- ✅ Calendar event linked to task in Kanban board
- ✅ Works with existing Google Calendar

---

## Step 1: Enable Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Library**
4. Search for "Google Calendar API"
5. Click **Enable**

---

## Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configure consent screen if needed:
   - User Type: **External**
   - App name: "Dynamic CRM Calendar"
   - User support email: your email
   - Add test users: your email
4. Application type: **Web application**
5. Name: "Dynamic CRM Backend"
6. Authorized redirect URIs: `http://localhost:3001/oauth2callback`
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

---

## Step 3: Get Refresh Token

### Option A: Using Node.js Script (Recommended)

1. Create a file `get-refresh-token.js` in the `backend` folder:

```javascript
const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const open = require('open');

const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3001/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const scopes = ['https://www.googleapis.com/auth/calendar'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent',
});

console.log('Opening browser for authentication...');
console.log('Auth URL:', authUrl);

const server = http.createServer(async (req, res) => {
  if (req.url.indexOf('/oauth2callback') > -1) {
    const qs = new url.URL(req.url, 'http://localhost:3001').searchParams;
    const code = qs.get('code');
    
    res.end('Authentication successful! You can close this window.');
    
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n✅ Success! Add this to your .env file:\n');
    console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
    
    server.close();
    process.exit(0);
  }
});

server.listen(3001, () => {
  open(authUrl);
});
```

2. Install required package:
```bash
npm install open
```

3. Run the script:
```bash
node get-refresh-token.js
```

4. Browser will open → Sign in with Google → Allow permissions
5. Copy the refresh token printed in console

### Option B: Using OAuth Playground

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click settings (⚙️) → Check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. Select "Google Calendar API v3" → `https://www.googleapis.com/auth/calendar`
5. Click "Authorize APIs"
6. Sign in and allow permissions
7. Click "Exchange authorization code for tokens"
8. Copy the **Refresh token**

---

## Step 4: Configure Backend Environment

Update `backend/.env`:

```properties
PORT=3001

# Google Calendar API Configuration
GOOGLE_CLIENT_ID=your_actual_client_id
GOOGLE_CLIENT_SECRET=your_actual_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/oauth2callback
GOOGLE_REFRESH_TOKEN=your_actual_refresh_token
```

---

## Step 5: Restart Backend Server

```bash
cd backend
npm install googleapis
node server.js
```

---

## Usage

### In Kanban Board:

1. **Create or Edit a Task**
2. **Fill in Schedule & Deadline section:**
   - Start Date
   - Start Time
   - End Date (Deadline)
   - End Time
3. **Assign to team member** (their email from Google Sheets)
4. **Click "Save Changes"**

### What Happens:

✅ Task saved with date/time information
✅ Google Calendar event created automatically
✅ Email invitation sent to assignee (if email exists)
✅ Reminders set:
   - Email reminder 1 day before
   - Popup reminder 30 minutes before
✅ Success toast notification shown

---

## Troubleshooting

### Error: "Invalid or expired refresh token"

**Solution:** Regenerate refresh token using Step 3

### Error: "Calendar authentication failed"

**Solution:** 
1. Check if Google Calendar API is enabled
2. Verify credentials in `.env` are correct
3. Make sure refresh token was generated with `calendar` scope

### No email invitation sent to assignee

**Causes:**
- Assignee email not found in Google Sheets
- Email column not detected (should contain word "email")
- Assignee not selected in task

### Event not showing in calendar

**Solution:**
1. Check backend console for errors
2. Verify the account used for refresh token
3. Check if event was created in "primary" calendar

---

## Testing

1. **Create a test task:**
   - Title: "Test Calendar Integration"
   - Start: Today 2:00 PM
   - End: Today 3:00 PM
   - Assignee: Your email

2. **Check your Google Calendar**
3. **Check your email** for event invitation

---

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to Git
- Keep refresh token secure
- Use environment variables in production
- Refresh tokens don't expire unless revoked
- Consider using service accounts for production

---

## Additional Features

### Customize Reminders

Edit `server.js` line ~1980:

```javascript
reminders: {
  useDefault: false,
  overrides: [
    { method: 'email', minutes: 24 * 60 },  // 1 day before
    { method: 'popup', minutes: 30 },        // 30 min before
    { method: 'popup', minutes: 10 },        // Add 10 min reminder
  ],
},
```

### Add Event Color

```javascript
colorId: '11',  // 1-11 different colors
```

### Set Event Location

```javascript
location: 'Conference Room A',
```

---

## API Endpoint

### POST `/api/create-calendar-event`

**Request Body:**
```json
{
  "summary": "Task Title",
  "description": "Task description with project details",
  "startDateTime": "2025-10-30T14:00:00",
  "endDateTime": "2025-10-30T15:00:00",
  "attendeeEmail": "user@example.com",
  "timeZone": "Asia/Kolkata"
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "abc123xyz",
  "eventLink": "https://calendar.google.com/event?eid=...",
  "data": { /* full event object */ }
}
```

---

## Support

For issues or questions:
1. Check backend console logs
2. Verify Google Calendar API quota not exceeded
3. Test with OAuth Playground first
4. Check Google Cloud Console for API usage

---

**Setup complete!** 🎉 Your tasks will now automatically create Google Calendar events!
