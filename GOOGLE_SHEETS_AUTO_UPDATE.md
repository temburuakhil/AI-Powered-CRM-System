# Google Sheets Auto-Update Setup Guide

## 🎯 Overview

After sending emails, the system can automatically update the Google Sheets "Status" column from "Not Completed" to "Completed". This guide shows you how to set it up.

## ✅ What's Already Working

**Without any setup**, the system already:
- ✅ Updates the status in the **UI immediately**
- ✅ Shows "Completed" in the DataTable
- ✅ Filters out completed records from future campaigns

**What needs setup**: Automatically updating the **actual Google Sheets** file

## 🚀 Quick Setup (Google Apps Script Method)

This is the **easiest and recommended** method. No API keys or OAuth needed!

### Step 1: Open Your Google Sheet

1. Go to your Google Sheet that contains the employee data
2. Click **Extensions** → **Apps Script**
3. You'll see a code editor

### Step 2: Add the Apps Script Code

Delete any existing code and paste this:

```javascript
function doPost(e) {
  try {
    // Parse the incoming request
    const data = JSON.parse(e.postData.contents);
    const sheetId = data.sheetId;
    const gid = data.gid || "0";
    const updates = data.updates || [];
    
    // Open the spreadsheet
    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheets()[parseInt(gid)] || ss.getSheets()[0];
    
    // Get all data
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values[0];
    
    // Find the Email column (case-insensitive, matches "Email", "EMAIL", "email", etc.)
    const emailColIndex = headers.findIndex(h => 
      h && h.toString().toLowerCase().includes('email')
    );
    
    // Find the Status column (case-insensitive, matches "Status", "EMAIL STATUS", "status", etc.)
    const statusColIndex = headers.findIndex(h => 
      h && h.toString().toLowerCase().includes('status')
    );
    
    if (emailColIndex === -1 || statusColIndex === -1) {
      throw new Error('Email or Status column not found. Headers: ' + headers.join(', '));
    }
    
    Logger.log('Found columns - Email: ' + headers[emailColIndex] + ', Status: ' + headers[statusColIndex]);
    
    // Track updates
    let updatedCount = 0;
    
    // Apply updates
    for (let i = 1; i < values.length; i++) {
      const rowEmail = values[i][emailColIndex];
      
      // Check if this email needs to be updated
      const updateItem = updates.find(u => u.email === rowEmail);
      
      if (updateItem) {
        // Update the status cell
        sheet.getRange(i + 1, statusColIndex + 1).setValue(updateItem.newStatus);
        updatedCount++;
        Logger.log(`Updated row ${i + 1}: ${rowEmail} -> ${updateItem.newStatus}`);
      }
    }
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: `Updated ${updatedCount} rows`,
      updatedCount: updatedCount
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function (optional)
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        sheetId: 'your-sheet-id-here',
        gid: '0',
        updates: [
          { email: 'test@example.com', statusColumn: 'Status', newStatus: 'Completed' }
        ]
      })
    }
  };
  
  const result = doPost(testData);
  Logger.log(result.getContent());
}
```

### Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Fill in the settings:
   - **Description**: "Email Campaign Status Updater"
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** (don't worry, only you have the URL)
5. Click **Deploy**
6. Click **Authorize access**
7. Choose your Google account
8. Click **Advanced** → **Go to [Your Project]**
9. Click **Allow**
10. **COPY THE WEB APP URL** - it looks like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

### Step 4: Configure Backend

1. Open `backend/.env` file
2. Add this line:
   ```env
   GOOGLE_APPS_SCRIPT_WEBHOOK=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```
   Replace with your actual URL from Step 3

3. Restart the backend server:
   ```powershell
   cd backend
   npm start
   ```

### Step 5: Test It!

1. Go to your app (http://localhost:8081)
2. Navigate to a project
3. Click "Email Campaign"
4. Generate and send emails
5. **Check your Google Sheet** - Status should auto-update to "Completed"! ✅

## 🔍 Verification

### Check Backend Logs

After sending emails, you should see in the backend terminal:

```
Sheet update requested: { sheetId: '...', gid: '0', updateCount: 3 }
Google Sheets updated via Apps Script: { success: true, updatedCount: 3 }
```

### Check Frontend Toast

You should see two toast notifications:
1. "Campaign Complete! Successfully sent X emails"
2. "Sheets Updated! Google Sheets has been updated with completed statuses."

### Check Google Sheet

Open your Google Sheet and verify:
- Rows where emails were sent show "Completed" in Status column
- Updates happened automatically after email campaign

## 🛠️ Alternative: Google Sheets API (Advanced)

If you prefer using the official Google Sheets API instead of Apps Script:

### Prerequisites

1. Google Cloud Project
2. Enable Google Sheets API
3. Create Service Account
4. Download credentials JSON

### Setup Steps

1. **Create Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable Google Sheets API
   - Create Service Account
   - Download JSON key file

2. **Share Sheet with Service Account**:
   - Open your Google Sheet
   - Click "Share"
   - Add the service account email (e.g., `your-service@project.iam.gserviceaccount.com`)
   - Give "Editor" access

3. **Configure Backend**:
   
   Update `backend/.env`:
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

4. **Install Google APIs**:
   ```powershell
   cd backend
   npm install googleapis
   ```

5. **Update server.js** (code provided in next section)

### Google Sheets API Code

Add this to `backend/server.js` after the imports:

```javascript
const { google } = require('googleapis');

// Google Sheets API setup
async function updateGoogleSheet(sheetId, gid, updates) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Get sheet name from gid
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });
    
    const sheet = spreadsheet.data.sheets[parseInt(gid) || 0];
    const sheetName = sheet.properties.title;
    
    // Get all data to find row numbers
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:Z`,
    });
    
    const rows = dataResponse.data.values;
    const headers = rows[0];
    const emailColIndex = headers.indexOf('Email');
    const statusColIndex = headers.indexOf('Status');
    
    // Build batch update requests
    const requests = [];
    
    for (let i = 1; i < rows.length; i++) {
      const rowEmail = rows[i][emailColIndex];
      const updateItem = updates.find(u => u.email === rowEmail);
      
      if (updateItem) {
        requests.push({
          range: `${sheetName}!${String.fromCharCode(65 + statusColIndex)}${i + 1}`,
          values: [[updateItem.newStatus]]
        });
      }
    }
    
    // Execute batch update
    if (requests.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: sheetId,
        resource: {
          valueInputOption: 'RAW',
          data: requests,
        },
      });
    }
    
    return { success: true, updatedCount: requests.length };
    
  } catch (error) {
    console.error('Google Sheets API error:', error);
    throw error;
  }
}
```

Then update the `/api/update-sheet` endpoint to use this function.

## 🐛 Troubleshooting

### Apps Script Issues

**Error: "Authorization required"**
- Solution: Make sure you authorized the script in Step 3
- Re-deploy and re-authorize if needed

**Error: "Email or Status column not found"**
- Solution: Check your Google Sheet has columns named exactly "Email" and "Status"
- Column names are case-sensitive

**Error: "Cannot open spreadsheet"**
- Solution: The Apps Script must be created in the SAME Google account that owns the sheet
- Or share the sheet with the script's owner

### Backend Issues

**Error: "GOOGLE_APPS_SCRIPT_WEBHOOK not set"**
- Solution: Add the webhook URL to `backend/.env`
- Restart the backend server after adding

**No toast notification "Sheets Updated"**
- Check backend logs for errors
- Verify the webhook URL is correct
- Test the Apps Script URL directly in browser (should return JSON)

### Sheet Not Updating

**Statuses show "Completed" in UI but not in Google Sheet**
- This is expected if Apps Script is not set up
- The UI update is immediate and always works
- Follow the Apps Script setup to enable sheet updates

**Only some rows updated**
- Check the Email column values match exactly (no extra spaces)
- Verify the Status column name is exactly "Status"

**Updates are slow**
- Apps Script can take 1-2 seconds per update
- This is normal for Google's infrastructure
- Updates happen in the background

## 📊 Testing the Setup

### Quick Test

1. **Manual Test of Apps Script**:
   - Open the Apps Script editor
   - Update the `testDoPost()` function with your sheet ID
   - Click Run → testDoPost
   - Check Execution log (View → Logs)
   - Should see success message

2. **Test via Postman/Curl**:
   ```bash
   curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
     -H "Content-Type: application/json" \
     -d '{
       "sheetId": "your-sheet-id",
       "gid": "0",
       "updates": [
         {"email": "test@example.com", "newStatus": "Completed"}
       ]
     }'
   ```

3. **Test via Application**:
   - Send test email campaign
   - Check backend logs
   - Check Google Sheet
   - Verify status updated

## ✅ Success Checklist

- [ ] Apps Script code deployed as Web App
- [ ] Webhook URL copied and added to `backend/.env`
- [ ] Backend server restarted
- [ ] Test email campaign sent
- [ ] Backend logs show "Google Sheets updated via Apps Script"
- [ ] Toast notification shows "Sheets Updated!"
- [ ] Google Sheet shows "Completed" status
- [ ] Future email campaigns exclude completed records

## 🎉 Benefits

Once set up, you get:

✅ **Automatic Updates**: No manual work needed
✅ **Real-time Sync**: Sheet updates within seconds
✅ **Accurate Records**: Always know who received emails
✅ **Prevent Duplicates**: Completed records excluded from future campaigns
✅ **Audit Trail**: Google Sheets edit history tracks all changes
✅ **No API Quotas**: Apps Script is free and unlimited

## 💡 Pro Tips

1. **Backup Your Sheet**: Make a copy before testing
2. **Test with Few Rows**: Start with 1-2 test emails
3. **Check Edit History**: Use Google Sheets version history to verify updates
4. **Monitor Logs**: Keep backend terminal visible during testing
5. **Use Test Sheet**: Create a duplicate sheet for testing the setup

## 🔒 Security Notes

- Apps Script webhook URL is private - don't share publicly
- Only your backend server should call this URL
- The script runs as YOU, so it has access to your sheets
- Consider adding authentication to the webhook for production
- Regenerate webhook URL if accidentally exposed

---

**Ready to enable auto-updates?** Follow the Quick Setup section and your Google Sheets will automatically update after every email campaign! 🚀📊
