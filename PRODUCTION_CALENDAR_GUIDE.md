# Production Deployment Guide - Google Calendar Integration

## 🎯 Overview
This guide covers deploying the Google Calendar integration to production with proper security, OAuth flow, and credential management.

---

## 🔒 Security Features

### ✅ Production-Ready Implementation
- **No hardcoded credentials** - Uses secure file-based storage
- **Automatic token refresh** - Handles expired access tokens
- **OAuth 2.0 flow** - Industry-standard authentication
- **Secure token storage** - Encrypted credential files
- **Easy revocation** - One-click disconnect
- **Error handling** - Graceful degradation if calendar unavailable

---

## 📋 Prerequisites

1. **Google Cloud Project** with Calendar API enabled
2. **OAuth 2.0 Credentials** (Web application type)
3. **Production domain** or **ngrok** for testing
4. **Node.js backend** server

---

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "Dynamic CRM Production")
3. Note your **Project ID**

### Step 2: Enable Calendar API

1. Navigate to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (for public apps) or **Internal** (for workspace)
3. Fill in application information:
   ```
   App name: Dynamic CRM
   User support email: your-email@domain.com
   Developer contact: your-email@domain.com
   ```
4. Add scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
5. Add test users (your email) if in testing mode
6. **Publish app** when ready for production

### Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: "Dynamic CRM Backend"
5. **Authorized redirect URIs:**
   ```
   Production: https://your-domain.com/oauth2callback
   Staging: https://staging.your-domain.com/oauth2callback
   Local: http://localhost:3001/oauth2callback
   ```
6. Click **Create**
7. **Download JSON** (this is your credentials file)

### Step 5: Setup Backend Files

1. **Rename downloaded file:**
   ```bash
   mv ~/Downloads/client_secret_*.json backend/google-credentials.json
   ```

2. **Verify file structure:**
   ```json
   {
     "web": {
       "client_id": "123456...apps.googleusercontent.com",
       "project_id": "your-project",
       "auth_uri": "https://accounts.google.com/o/oauth2/auth",
       "token_uri": "https://oauth2.googleapis.com/token",
       "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
       "client_secret": "GOCSPX-...",
       "redirect_uris": [
         "https://your-domain.com/oauth2callback"
       ]
     }
   }
   ```

3. **Important:** Add to `.gitignore`:
   ```
   backend/google-credentials.json
   backend/google-tokens.json
   ```

### Step 6: Deploy Backend Server

#### Option A: Traditional Server (VPS, EC2, etc.)

```bash
# SSH into your server
ssh user@your-server.com

# Navigate to app directory
cd /var/www/your-app/backend

# Copy credentials securely
scp google-credentials.json user@your-server.com:/var/www/your-app/backend/

# Install dependencies
npm install

# Start with PM2 (process manager)
pm2 start server.js --name "crm-backend"
pm2 save
pm2 startup
```

#### Option B: Vercel/Serverless

⚠️ **Note:** Google Calendar OAuth requires persistent storage for tokens. Serverless platforms need modifications:

1. **Use database for token storage** (MongoDB, PostgreSQL)
2. **Or use Redis** for session management
3. **Or use Vercel KV** for token persistence

```javascript
// Example: Store tokens in database instead of file
async saveTokens(tokens) {
  await db.collection('oauth_tokens').updateOne(
    { service: 'google_calendar' },
    { $set: { tokens, updatedAt: new Date() } },
    { upsert: true }
  );
}
```

#### Option C: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# Create directory for credentials with proper permissions
RUN mkdir -p /app/credentials && chmod 700 /app/credentials

EXPOSE 3001
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    volumes:
      - ./backend/google-credentials.json:/app/google-credentials.json:ro
      - calendar-tokens:/app/
    environment:
      - NODE_ENV=production
      - PORT=3001
    restart: unless-stopped

volumes:
  calendar-tokens:
```

### Step 7: Complete OAuth Setup (Production)

1. **Access setup page:**
   ```
   https://your-domain.com:3001/google-calendar-setup
   ```

2. **Click "Connect Google Calendar"**

3. **Sign in with Google** (use the account you want to create events in)

4. **Grant permissions:**
   - View and edit events on all your calendars
   - Create new events

5. **Redirected back** - Setup complete!

6. **Verify authentication:**
   ```bash
   curl https://your-domain.com:3001/api/calendar-status
   ```
   
   Response:
   ```json
   {
     "enabled": true,
     "authenticated": true,
     "setupUrl": "/google-calendar-setup"
   }
   ```

---

## 🔐 Environment Variables (Optional)

While the new system uses `google-credentials.json`, you can still use environment variables for additional configuration:

```bash
# backend/.env (optional)
PORT=3001
NODE_ENV=production

# Optional: Override redirect URI
GOOGLE_REDIRECT_URI=https://your-domain.com/oauth2callback

# Email configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🌐 Domain & SSL Configuration

### For Production Domains:

1. **Update OAuth redirect URIs** in Google Cloud Console:
   ```
   https://your-domain.com/oauth2callback
   ```

2. **Update credentials file:**
   ```json
   {
     "web": {
       "redirect_uris": [
         "https://your-domain.com/oauth2callback",
         "https://www.your-domain.com/oauth2callback"
       ]
     }
   }
   ```

3. **Use HTTPS** (required by Google for production):
   - Use Let's Encrypt (free SSL)
   - Or Cloudflare SSL
   - Or load balancer SSL termination

### Nginx Configuration Example:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /oauth2callback {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }

    location /google-calendar-setup {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }
}
```

---

## 🧪 Testing in Production

### Test Calendar Event Creation:

```bash
# Check status
curl https://your-domain.com:3001/api/calendar-status

# Create test event
curl -X POST https://your-domain.com:3001/api/create-calendar-event \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Production Test Event",
    "description": "Testing calendar integration",
    "startDateTime": "2025-10-30T14:00:00",
    "endDateTime": "2025-10-30T15:00:00",
    "attendeeEmail": "test@example.com",
    "timeZone": "Asia/Kolkata"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Calendar event created successfully",
  "eventId": "abc123xyz",
  "eventLink": "https://calendar.google.com/event?eid=...",
  "meetLink": "https://meet.google.com/xxx-yyyy-zzz"
}
```

---

## 🔄 Token Refresh Flow

The system automatically handles token refresh:

```javascript
// Automatic refresh on API calls
1. User creates task with dates
2. Frontend calls /api/create-calendar-event
3. Backend checks token expiration
4. If expired, automatically refreshes using refresh token
5. Creates calendar event
6. Returns success
```

---

## 🔧 Troubleshooting

### ❌ "OAuth client not initialized"

**Cause:** `google-credentials.json` file missing or invalid

**Solution:**
```bash
# Check file exists
ls -la backend/google-credentials.json

# Verify JSON format
cat backend/google-credentials.json | jq

# Re-download from Google Cloud Console if needed
```

### ❌ "Invalid redirect URI"

**Cause:** Redirect URI in request doesn't match Google Console

**Solution:**
1. Check `google-credentials.json` → `redirect_uris`
2. Update in Google Cloud Console to match
3. Or update file to match Console
4. Restart server

### ❌ "Calendar integration not configured"

**Cause:** OAuth flow not completed

**Solution:**
```bash
# Visit setup page
https://your-domain.com/google-calendar-setup

# Click "Connect Google Calendar"
# Complete OAuth flow
# Verify status
curl https://your-domain.com/api/calendar-status
```

### ❌ "Token expired" after long time

**Cause:** Refresh token revoked or expired

**Solution:**
```bash
# Revoke and re-authenticate
curl https://your-domain.com/google-calendar-revoke

# Complete OAuth again
# Visit /google-calendar-setup
```

---

## 📊 Monitoring & Logs

### Check Authentication Status:

```bash
# Server logs
pm2 logs crm-backend

# Or direct logs
tail -f /var/log/crm-backend.log
```

### Expected log output:

```
✅ Email backend server is running on http://localhost:3001
📅 Google Calendar integration: ENABLED
✅ Google Calendar authentication loaded
Creating Google Calendar event: Task Title
Adding attendee: user@example.com
✅ Calendar event created: abc123xyz
Event link: https://calendar.google.com/event?eid=...
```

---

## 🔐 Security Best Practices

### 1. File Permissions:
```bash
# Restrict credentials file
chmod 600 backend/google-credentials.json
chmod 600 backend/google-tokens.json

# Owner only access
chown www-data:www-data backend/google-credentials.json
```

### 2. Firewall Rules:
```bash
# Only allow HTTPS traffic
ufw allow 443/tcp
ufw allow 80/tcp  # For Let's Encrypt renewal
ufw deny 3001/tcp # Block direct backend access
```

### 3. Reverse Proxy:
- Always use nginx/Apache in front of Node.js
- Never expose Node.js directly to internet
- Use SSL/TLS termination at reverse proxy

### 4. Rate Limiting:
```javascript
// Add to server.js
const rateLimit = require('express-rate-limit');

const calendarLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many calendar requests, please try again later.'
});

app.use('/api/create-calendar-event', calendarLimiter);
```

### 5. Input Validation:
```javascript
// Validate datetime format
const moment = require('moment');

if (!moment(startDateTime, moment.ISO_8601).isValid()) {
  return res.status(400).json({
    success: false,
    message: 'Invalid startDateTime format. Use ISO 8601.'
  });
}
```

---

## 🚨 Emergency Procedures

### Revoke All Access:

1. **Via API:**
   ```bash
   curl https://your-domain.com/google-calendar-revoke
   ```

2. **Via Google:**
   - Go to https://myaccount.google.com/permissions
   - Find "Dynamic CRM"
   - Click "Remove Access"

3. **Delete tokens:**
   ```bash
   rm backend/google-tokens.json
   ```

### Rotate Credentials:

1. Create new OAuth client in Google Console
2. Download new credentials
3. Replace `google-credentials.json`
4. Restart server
5. Complete OAuth flow again

---

## 📈 Scaling Considerations

### Multiple Users:

Current implementation: **Single calendar account** (server OAuth)

For multi-user support:
1. Store tokens per user in database
2. Implement user-specific OAuth flow
3. Create events in each user's calendar

```javascript
// Example: Multi-user implementation
const getUserTokens = async (userId) => {
  return await db.collection('user_calendar_tokens').findOne({ userId });
};

const createEventForUser = async (userId, eventData) => {
  const tokens = await getUserTokens(userId);
  const oauth2Client = new google.auth.OAuth2(...);
  oauth2Client.setCredentials(tokens);
  // Create event...
};
```

### High Traffic:

1. **Queue system** for calendar events:
   ```javascript
   const Queue = require('bull');
   const calendarQueue = new Queue('calendar-events');
   
   calendarQueue.process(async (job) => {
     await createCalendarEvent(job.data);
   });
   ```

2. **Caching** for token validation:
   ```javascript
   const redis = require('redis');
   const client = redis.createClient();
   
   // Cache token validity for 1 hour
   await client.set('calendar_token_valid', 'true', 'EX', 3600);
   ```

---

## ✅ Production Checklist

- [ ] Google Cloud Project created
- [ ] Calendar API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] `google-credentials.json` downloaded and secured
- [ ] Redirect URIs match production domain
- [ ] SSL/HTTPS configured
- [ ] OAuth flow completed successfully
- [ ] Test event created successfully
- [ ] Tokens stored securely (600 permissions)
- [ ] Files added to `.gitignore`
- [ ] Server logs monitored
- [ ] Backup strategy for tokens
- [ ] Rate limiting implemented
- [ ] Error handling tested
- [ ] Revocation procedure documented

---

## 📚 Additional Resources

- **Google Calendar API Docs:** https://developers.google.com/calendar/api
- **OAuth 2.0 Guide:** https://developers.google.com/identity/protocols/oauth2
- **API Quotas:** https://console.cloud.google.com/iam-admin/quotas
- **Security Best Practices:** https://developers.google.com/identity/protocols/oauth2/production-readiness

---

**Production deployment complete!** 🎉 Your calendar integration is now enterprise-ready!
