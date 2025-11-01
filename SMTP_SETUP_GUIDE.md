# SMTP Configuration Guide for Manager Credentials Email

## Overview
When creating a new manager through the Admin Portal, the system automatically sends their login credentials via email. This guide explains how to configure SMTP for this feature.

---

## Gmail SMTP Configuration (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification**

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter: "BPUT CRM Manager System"
5. Click **Generate**
6. **Copy the 16-character password** (you won't see it again)

### Step 3: Update `.env` File
Open `backend/.env` and update these values:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
```

**Example:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=admin@bput.edu
SMTP_PASSWORD=abcd efgh ijkl mnop
```

---

## Alternative SMTP Providers

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

### Outlook/Office 365
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASSWORD=your_password
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your_email@yahoo.com
SMTP_PASSWORD=your_app_password
```

---

## How It Works

### 1. Admin Creates Manager
- Admin fills out the Create Manager form with:
  - Manager Name (Full Name)
  - Username (for login)
  - Email Address
  - Password

### 2. Backend Processing
```javascript
POST /api/auth/create-manager
- Creates user in MongoDB
- Hashes password with bcrypt
- Stores in database

POST /api/send-manager-credentials
- Sends beautifully formatted email
- Includes username and password
- Provides login link
- Includes security notice
```

### 3. Email Content
The manager receives a professional email with:
- ✅ Welcome message with their name
- ✅ Username and password in formatted boxes
- ✅ Direct login link
- ✅ Quick start guide
- ✅ Security notice

---

## Testing the Email Feature

### Test Configuration
```bash
# In backend directory
cd backend

# Make sure .env has SMTP credentials
cat .env | grep SMTP

# Restart the backend server
npm run dev
```

### Create Test Manager
1. Login as admin: `admin` / `Admin@123`
2. Go to Admin Portal
3. Click "Create New Manager"
4. Fill in the form:
   ```
   Manager Name: Test Manager
   Username: test_manager
   Email: your_test_email@gmail.com
   Password: Test@123
   ```
5. Click "Create Manager & Send Credentials"
6. Check the test email inbox

### Expected Results
✅ Manager created in database  
✅ Email sent successfully  
✅ Toast notification: "Manager created successfully. Credentials sent to [email]"  
✅ Email received with formatted credentials  

---

## Troubleshooting

### Error: "Email service not configured"
**Problem:** SMTP credentials missing from `.env`

**Solution:**
1. Check if `.env` has all 4 SMTP variables
2. Restart backend server after updating `.env`
```bash
cd backend
npm run dev
```

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Problem:** Using regular Gmail password instead of App Password

**Solution:**
1. Enable 2FA on Google Account
2. Generate new App Password
3. Use 16-character App Password (not regular password)

### Error: "Connection timeout"
**Problem:** Port 587 might be blocked or wrong SMTP host

**Solution:**
1. Try port 465 with `secure: true`:
```env
SMTP_PORT=465
```
2. Check firewall settings
3. Try different SMTP provider

### Email Not Received
**Check:**
1. ✅ Email in Spam/Junk folder
2. ✅ Email address typed correctly
3. ✅ Backend console for "Email sent successfully" message
4. ✅ SMTP credentials are valid

---

## Email Template Features

### 🎨 Beautiful Design
- Gradient purple theme matching BPUT CRM
- Professional layout
- Mobile-responsive
- Easy to read credentials

### 🔐 Security Features
- Credentials in highlighted boxes
- Security warning included
- Recommendation to change password
- Clear identification as automated email

### 📋 User-Friendly
- Direct login button
- Step-by-step quick start guide
- Clear instructions
- Contact information

---

## Environment Variables Reference

```env
# Required for manager credentials email
SMTP_HOST=smtp.gmail.com          # SMTP server address
SMTP_PORT=587                      # Port (587 for TLS, 465 for SSL)
SMTP_USER=your_email@gmail.com     # Your email address
SMTP_PASSWORD=your_app_password    # App password (not regular password)
```

---

## Security Best Practices

1. **Use App Passwords:** Never use your main email password
2. **Secure .env File:** Add `.env` to `.gitignore`
3. **Limit Access:** Only admins can create managers
4. **Strong Passwords:** Enforce minimum 6 characters for manager passwords
5. **HTTPS in Production:** Use secure connection for login page
6. **Password Change:** Encourage managers to change password on first login

---

## Production Deployment

### Update Login URL
When deploying to production, update the login URL in `backend/server.js`:

```javascript
// Find this line in /api/send-manager-credentials endpoint
<a href="http://localhost:8081/landing" 

// Change to your production URL
<a href="https://your-domain.com/landing"
```

### Use Environment Variable
Better approach - add to `.env`:
```env
APP_URL=https://your-domain.com
```

Then in code:
```javascript
<a href="${process.env.APP_URL || 'http://localhost:8081'}/landing"
```

---

## FAQ

**Q: Can I use a free email service?**  
A: Yes, Gmail, Outlook, and Yahoo all support SMTP and are free.

**Q: How many emails can I send?**  
A: Gmail allows 500 emails per day for free accounts.

**Q: Is the password secure in the email?**  
A: Emails are sent over TLS encryption. However, email is not the most secure method. For production, consider implementing a "set password on first login" flow.

**Q: Can I customize the email template?**  
A: Yes! Edit the HTML in `backend/server.js` at the `/api/send-manager-credentials` endpoint.

**Q: What if SMTP is not configured?**  
A: The manager will still be created in the database, but the email won't be sent. Admin can manually share credentials.

---

## Support

For issues or questions:
1. Check backend console logs for error messages
2. Verify SMTP credentials are correct
3. Test SMTP connection using online tools
4. Review this guide's troubleshooting section

---

## Summary

✅ **Quick Setup (5 minutes):**
1. Enable 2FA on Gmail
2. Generate App Password
3. Add to `backend/.env`
4. Restart backend server
5. Test by creating a manager

✅ **Features:**
- Automatic email on manager creation
- Beautiful, professional email template
- Secure credential delivery
- User-friendly instructions

✅ **Secure:**
- App passwords (not main password)
- TLS encryption
- Password hashing in database
- Security warnings in email
