const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const open = require('open');

// INSTRUCTIONS:
// 1. Replace CLIENT_ID and CLIENT_SECRET below with your actual credentials
// 2. Run: npm install open googleapis
// 3. Run: node get-refresh-token.js
// 4. Browser will open automatically for authentication
// 5. Copy the refresh token to your .env file

const CLIENT_ID = '1071957113778-k61okkq42rte5h085aol7qitfd3qk796.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3001/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Request full calendar access
const scopes = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',  // Required for refresh token
  scope: scopes,
  prompt: 'consent',        // Force consent to get refresh token
});

console.log('═══════════════════════════════════════════════════════');
console.log('   Google Calendar OAuth 2.0 - Get Refresh Token');
console.log('═══════════════════════════════════════════════════════');
console.log('\n📝 Make sure you have:');
console.log('  1. Enabled Google Calendar API in Cloud Console');
console.log('  2. Created OAuth 2.0 credentials');
console.log('  3. Updated CLIENT_ID and CLIENT_SECRET in this file\n');
console.log('🌐 Opening browser for authentication...\n');

const server = http.createServer(async (req, res) => {
  try {
    if (req.url.indexOf('/oauth2callback') > -1) {
      const qs = new url.URL(req.url, 'http://localhost:3001').searchParams;
      const code = qs.get('code');
      
      if (!code) {
        res.end('❌ No authorization code received. Please try again.');
        server.close();
        process.exit(1);
      }

      // Send success page to browser
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              text-align: center;
              max-width: 500px;
            }
            .checkmark {
              font-size: 72px;
              color: #4CAF50;
              margin-bottom: 20px;
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
            }
            p {
              color: #666;
              line-height: 1.6;
            }
            .token-box {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin-top: 20px;
              font-family: monospace;
              font-size: 12px;
              word-break: break-all;
              border-left: 4px solid #4CAF50;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="checkmark">✓</div>
            <h1>Authentication Successful!</h1>
            <p>Your refresh token has been generated.</p>
            <p><strong>Check your terminal</strong> for the token and instructions.</p>
            <p style="margin-top: 20px; color: #999; font-size: 14px;">
              You can safely close this window now.
            </p>
          </div>
        </body>
        </html>
      `);
      
      // Exchange authorization code for tokens
      console.log('🔄 Exchanging authorization code for tokens...\n');
      const { tokens } = await oauth2Client.getToken(code);
      
      console.log('═══════════════════════════════════════════════════════');
      console.log('   ✅ SUCCESS! Refresh Token Generated');
      console.log('═══════════════════════════════════════════════════════\n');
      
      console.log('📋 Add this line to your backend/.env file:\n');
      console.log('─────────────────────────────────────────────────────');
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
      console.log('─────────────────────────────────────────────────────\n');
      
      if (tokens.expiry_date) {
        const expiryDate = new Date(tokens.expiry_date);
        console.log(`ℹ️  Access token expires: ${expiryDate.toLocaleString()}`);
        console.log('   (Refresh token does not expire unless revoked)\n');
      }
      
      console.log('📝 Next steps:');
      console.log('   1. Copy the GOOGLE_REFRESH_TOKEN line above');
      console.log('   2. Add it to backend/.env file');
      console.log('   3. Restart your backend server');
      console.log('   4. Test calendar integration in Kanban board\n');
      
      console.log('═══════════════════════════════════════════════════════\n');
      
      // Close server after 2 seconds
      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 2000);
    }
  } catch (error) {
    console.error('\n❌ Error getting tokens:', error.message);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial; padding: 40px; text-align: center;">
        <h1 style="color: #f44336;">❌ Error</h1>
        <p>${error.message}</p>
        <p>Check the terminal for details.</p>
      </body>
      </html>
    `);
    server.close();
    process.exit(1);
  }
});

// Start local server
server.listen(3001, () => {
  console.log('🚀 Local server started on http://localhost:3001\n');
  
  // Attempt to open browser automatically
  try {
    open(authUrl);
    console.log('✅ Browser opened automatically\n');
  } catch (err) {
    console.log('⚠️  Could not open browser automatically\n');
    console.log('Please open this URL manually:\n');
    console.log(authUrl);
    console.log('\n');
  }
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('\n❌ Error: Port 3001 is already in use');
    console.error('   Please stop your backend server first, then try again.\n');
  } else {
    console.error('\n❌ Server error:', err.message, '\n');
  }
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Process interrupted. Exiting...\n');
  server.close();
  process.exit(0);
});
